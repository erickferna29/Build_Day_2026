import re
from langchain_core.tools import tool


# ──────────────────────────────────────────────
# Helpers internos (no expuestos como tools)
# ──────────────────────────────────────────────

_RFC_PATRON = re.compile(
    r"^[A-ZÑ&]{3,4}"   # 3 letras (moral) o 4 (física) + Ñ/&
    r"\d{2}"            # año
    r"(0[1-9]|1[0-2])" # mes 01-12
    r"(0[1-9]|[12]\d|3[01])"  # día 01-31
    r"[A-Z0-9]{3}$",    # homoclave
    re.IGNORECASE,
)

_INE_PATRON = re.compile(
    r"^[A-Z]{6}"        # 6 letras iniciales del nombre
    r"\d{8}"            # fecha de nacimiento AAAAMMDD
    r"[HM]"             # sexo H/M
    r"[A-Z]{2}"         # clave de entidad federativa
    r"[A-Z0-9]{3}"      # consonantes del nombre
    r"\d{2}$",          # dígitos de emisión
    re.IGNORECASE,
)

_RFC_DIGITO_VERIFICADOR = {
    "0": 0,  "1": 1,  "2": 2,  "3": 3,  "4": 4,
    "5": 5,  "6": 6,  "7": 7,  "8": 8,  "9": 9,
    "A": 10, "B": 11, "C": 12, "D": 13, "E": 14,
    "F": 15, "G": 16, "H": 17, "I": 18, "J": 19,
    "K": 20, "L": 21, "M": 22, "N": 23, "Ñ": 24,
    "O": 25, "P": 26, "Q": 27, "R": 28, "S": 29,
    "T": 30, "U": 31, "V": 32, "W": 33, "X": 34,
    "Y": 35, "Z": 36, "&": 37,
}

_PALABRAS_OBSCENAS_RFC = {
    "BACA", "BAKA", "BUEI", "BUEY", "CACA", "CACO", "CAGA", "CAGO",
    "CAKA", "CAKO", "COGE", "COGI", "COJA", "COJE", "COJI", "COJO",
    "COLA", "CULO", "FALO", "FETO", "GETA", "GUEI", "GUEY", "JETA",
    "JOTO", "KACA", "KACO", "KAGA", "KAGO", "KAKA", "KAKO", "KOGE",
    "KOGI", "KOJA", "KOJE", "KOJI", "KOJO", "KOLA", "KULO", "LELO",
    "LOCA", "LOCO", "LOKA", "LOKO", "MAME", "MAMO", "MEAR", "MEAS",
    "MEON", "MIAR", "MION", "MOCO", "MOKO", "MULA", "MULO", "NACA",
    "NACO", "PEDA", "PEDO", "PENE", "PIPI", "PITO", "POPO", "PUTA",
    "PUTO", "QULO", "RATA", "ROBA", "ROBE", "ROBO", "RUIN", "SENO",
    "TETA", "VACA", "VAGA", "VAGO", "VAKA", "VUEI", "VUEY", "WUEI",
    "WUEY",
}


def _verificar_digito_rfc(rfc: str) -> bool:
    """Valida el dígito verificador de la homoclave (último carácter)."""
    rfc = rfc.upper()
    total = sum(
        _RFC_DIGITO_VERIFICADOR.get(c, 0) * (len(rfc) + 1 - i)
        for i, c in enumerate(rfc[:-1], start=1)
    )
    residuo = total % 11
    esperado = {0: "0", 1: "1", 2: "2", 3: "3", 4: "4",
                5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "A"}
    return rfc[-1].upper() == esperado.get(residuo, "")


def _fecha_valida(anio: str, mes: str, dia: str) -> bool:
    """Verifica que la fecha dentro del RFC/INE sea calendáricamente válida."""
    import datetime
    anio_int = int(anio)
    # El SAT usa años de 2 dígitos; tomamos el siglo más reciente plausible
    if anio_int > int(str(__import__("datetime").date.today().year)[-2:]):
        anio_int += 1900
    else:
        anio_int += 2000
    try:
        datetime.date(anio_int, int(mes), int(dia))
        return True
    except ValueError:
        return False


# ──────────────────────────────────────────────
# Tools
# ──────────────────────────────────────────────

@tool
def validar_rfc(rfc: str) -> bool:
    """Valida un RFC mexicano (personas físicas y morales).

    Realiza las siguientes verificaciones:
    - Longitud correcta (12 caracteres para moral, 13 para física).
    - Formato oficial del SAT mediante expresión regular.
    - Fecha de constitución/nacimiento calendáricamente válida.
    - Ausencia de palabras inconvenientes (lista oficial del SAT).
    - Dígito verificador correcto en la homoclave.

    Args:
        rfc: Cadena con el RFC a validar (mayúsculas o minúsculas, sin espacios).

    Returns:
        True si el RFC es estructuralmente válido, False en caso contrario.
    """
    if not isinstance(rfc, str):
        return False

    rfc = rfc.strip().upper()

    # 1. Longitud
    if len(rfc) not in (12, 13):
        return False

    # 2. Formato general
    if not _RFC_PATRON.match(rfc):
        return False

    # 3. Fecha válida
    # Para moral: XXXAAMMDD... / física: XXXXAAMMDD...
    offset = 0 if len(rfc) == 12 else 1
    anio = rfc[3 + offset: 5 + offset]
    mes  = rfc[5 + offset: 7 + offset]
    dia  = rfc[7 + offset: 9 + offset]
    if not _fecha_valida(anio, mes, dia):
        return False

    # 4. Palabras inconvenientes (solo aplica a los primeros 4 caracteres de personas físicas)
    if len(rfc) == 13 and rfc[:4] in _PALABRAS_OBSCENAS_RFC:
        return False

    # 5. Dígito verificador
    if not _verificar_digito_rfc(rfc):
        return False

    return True


@tool
def validar_ine(clave_elector: str) -> bool:
    """Valida la Clave de Elector de la credencial INE/IFE mexicana.

    Realiza las siguientes verificaciones:
    - Longitud exacta de 18 caracteres.
    - Formato oficial: 6 letras del nombre + 8 dígitos de fecha (AAAAMMDD)
      + 1 carácter de sexo (H/M) + 2 letras de entidad + 3 caracteres de
      consonantes + 2 dígitos de emisión.
    - Fecha de nacimiento calendáricamente válida.
    - Clave de entidad federativa reconocida (32 entidades + NE para
      mexicanos en el extranjero).

    Args:
        clave_elector: Cadena con la clave de elector a validar
                       (mayúsculas o minúsculas, sin espacios).

    Returns:
        True si la clave es estructuralmente válida, False en caso contrario.
    """
    _ENTIDADES_INE = {
        "AS", "BC", "BS", "CC", "CL", "CM", "CS", "CH", "DF", "DG",
        "GT", "GR", "HG", "JC", "MC", "MN", "MS", "NT", "NL", "OC",
        "PL", "QT", "QR", "SP", "SL", "SR", "TC", "TS", "TL", "VZ",
        "YN", "ZS", "NE",
    }

    if not isinstance(clave_elector, str):
        return False

    clave = clave_elector.strip().upper()

    # 1. Longitud exacta
    if len(clave) != 18:
        return False

    # 2. Formato general
    if not _INE_PATRON.match(clave):
        return False

    # 3. Fecha de nacimiento válida (posiciones 6-13: AAAAMMDD)
    anio = clave[6:10]
    mes  = clave[10:12]
    dia  = clave[12:14]
    try:
        import datetime
        datetime.date(int(anio), int(mes), int(dia))
    except ValueError:
        return False

    # 4. Entidad federativa reconocida (posiciones 15-16)
    entidad = clave[15:17]
    if entidad not in _ENTIDADES_INE:
        return False

    return True


# ──────────────────────────────────────────────
# Pruebas rápidas (ejecutar directamente)
# ──────────────────────────────────────────────

if __name__ == "__main__":
    casos_rfc = [
        ("GODE561231GR8", True,  "RFC persona física válido"),
        ("SAT970701NN3",  True,  "RFC persona moral válido"),
        ("XAXX010101000", True,  "RFC genérico público"),
        ("INVALID12345",  False, "Formato inválido"),
        ("GODE561340GR8", False, "Fecha inválida (mes 13)"),
        ("CAGO561231GR8", False, "Palabra inconveniente"),
        ("GODE56123",     False, "Longitud incorrecta"),
    ]

    casos_ine = [
        ("ROGFLN85060314HMCNRS09", True,  "Clave de elector válida"),
        ("ABCDEF123456789X",       False, "Longitud incorrecta"),
        ("ROGFLN85139914HMCNRS09", False, "Fecha inválida (mes 13)"),
        ("ROGFLN85060314HXXNRS09", False, "Entidad inválida"),
    ]

    print("=" * 55)
    print("  VALIDACIÓN DE RFC")
    print("=" * 55)
    for rfc, esperado, desc in casos_rfc:
        resultado = validar_rfc.invoke({"rfc": rfc})
        estado = "✓" if resultado == esperado else "✗"
        print(f"  {estado} [{desc}]")
        print(f"    RFC: {rfc!r:20s}  Esperado: {esperado}  Obtenido: {resultado}")

    print()
    print("=" * 55)
    print("  VALIDACIÓN DE INE")
    print("=" * 55)
    for clave, esperado, desc in casos_ine:
        resultado = validar_ine.invoke({"clave_elector": clave})
        estado = "✓" if resultado == esperado else "✗"
        print(f"  {estado} [{desc}]")
        print(f"    INE: {clave!r:25s}  Esperado: {esperado}  Obtenido: {resultado}")