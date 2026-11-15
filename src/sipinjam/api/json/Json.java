package sipinjam.api.json;

import java.lang.reflect.Array;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

/**
 * Utilitas parser dan serializer JSON murni tanpa dependensi eksternal (Pure JDK).
 * Mendukung Map, List, Object, Primitive, String, Enum, dan LocalDate/LocalTime.
 */
public class Json {

    // ==========================================
    // SERIALISASI (Object -> JSON String)
    // ==========================================

    public static String stringify(Object obj) {
        StringBuilder sb = new StringBuilder();
        serializeValue(obj, sb);
        return sb.toString();
    }

    @SuppressWarnings("unchecked")
    private static void serializeValue(Object obj, StringBuilder sb) {
        if (obj == null) {
            sb.append("null");
        } else if (obj instanceof String) {
            escapeString((String) obj, sb);
        } else if (obj instanceof Number || obj instanceof Boolean) {
            sb.append(obj.toString());
        } else if (obj instanceof Enum<?>) {
            escapeString(((Enum<?>) obj).name(), sb);
        } else if (obj instanceof LocalDate || obj instanceof LocalTime) {
            escapeString(obj.toString(), sb);
        } else if (obj instanceof Map<?, ?>) {
            serializeMap((Map<String, Object>) obj, sb);
        } else if (obj instanceof Collection<?>) {
            serializeCollection((Collection<?>) obj, sb);
        } else if (obj.getClass().isArray()) {
            serializeArray(obj, sb);
        } else {
            escapeString(obj.toString(), sb);
        }
    }

    private static void serializeMap(Map<String, Object> map, StringBuilder sb) {
        sb.append("{");
        boolean first = true;
        for (Map.Entry<String, Object> entry : map.entrySet()) {
            if (!first) {
                sb.append(",");
            }
            escapeString(entry.getKey(), sb);
            sb.append(":");
            serializeValue(entry.getValue(), sb);
            first = false;
        }
        sb.append("}");
    }

    private static void serializeCollection(Collection<?> col, StringBuilder sb) {
        sb.append("[");
        boolean first = true;
        for (Object item : col) {
            if (!first) {
                sb.append(",");
            }
            serializeValue(item, sb);
            first = false;
        }
        sb.append("]");
    }

    private static void serializeArray(Object arr, StringBuilder sb) {
        sb.append("[");
        int len = Array.getLength(arr);
        for (int i = 0; i < len; i++) {
            if (i > 0) {
                sb.append(",");
            }
            serializeValue(Array.get(arr, i), sb);
        }
        sb.append("]");
    }

    private static void escapeString(String s, StringBuilder sb) {
        sb.append('"');
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"': sb.append("\\\""); break;
                case '\\': sb.append("\\\\"); break;
                case '\b': sb.append("\\b"); break;
                case '\f': sb.append("\\f"); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '\t': sb.append("\\t"); break;
                default:
                    if (c < ' ') {
                        sb.append(String.format("\\u%04x", (int) c));
                    } else {
                        sb.append(c);
                    }
            }
        }
        sb.append('"');
    }

    // ==========================================
    // DESERIALISASI (JSON String -> Object / Map)
    // ==========================================

    @SuppressWarnings("unchecked")
    public static Map<String, Object> parseObject(String json) {
        Object res = parse(json);
        if (res instanceof Map<?, ?>) {
            return (Map<String, Object>) res;
        }
        return new LinkedHashMap<String, Object>();
    }

    @SuppressWarnings("unchecked")
    public static List<Object> parseArray(String json) {
        Object res = parse(json);
        if (res instanceof List<?>) {
            return (List<Object>) res;
        }
        return new ArrayList<Object>();
    }

    public static Object parse(String json) {
        if (json == null || json.trim().isEmpty()) {
            return null;
        }
        StringParser parser = new StringParser(json.trim());
        return parser.parseValue();
    }

    private static class StringParser {
        private final String src;
        private int idx;

        StringParser(String src) {
            this.src = src;
            this.idx = 0;
        }

        private void skipWhitespace() {
            while (idx < src.length() && Character.isWhitespace(src.charAt(idx))) {
                idx++;
            }
        }

        private char peek() {
            skipWhitespace();
            if (idx >= src.length()) return '\0';
            return src.charAt(idx);
        }

        private char next() {
            skipWhitespace();
            if (idx >= src.length()) return '\0';
            return src.charAt(idx++);
        }

        Object parseValue() {
            skipWhitespace();
            char c = peek();
            if (c == '{') return parseObjectInternal();
            if (c == '[') return parseArrayInternal();
            if (c == '"') return parseString();
            if (c == 't' || c == 'f') return parseBoolean();
            if (c == 'n') return parseNull();
            if (Character.isDigit(c) || c == '-') return parseNumber();
            throw new IllegalArgumentException("Karakter tidak terduga pada indeks " + idx + ": '" + c + "'");
        }

        private Map<String, Object> parseObjectInternal() {
            Map<String, Object> map = new LinkedHashMap<String, Object>();
            next(); // consume '{'
            skipWhitespace();
            if (peek() == '}') {
                next();
                return map;
            }

            while (true) {
                skipWhitespace();
                if (peek() != '"') {
                    throw new IllegalArgumentException("Key objek JSON harus berupa string pada indeks " + idx);
                }
                String key = parseString();
                skipWhitespace();
                if (next() != ':') {
                    throw new IllegalArgumentException("Titik dua ':' diharapkan setelah key pada indeks " + idx);
                }
                Object val = parseValue();
                map.put(key, val);

                skipWhitespace();
                char sep = next();
                if (sep == '}') break;
                if (sep != ',') {
                    throw new IllegalArgumentException("Koma ',' atau '}' diharapkan pada indeks " + idx);
                }
            }
            return map;
        }

        private List<Object> parseArrayInternal() {
            List<Object> list = new ArrayList<Object>();
            next(); // consume '['
            skipWhitespace();
            if (peek() == ']') {
                next();
                return list;
            }

            while (true) {
                list.add(parseValue());
                skipWhitespace();
                char sep = next();
                if (sep == ']') break;
                if (sep != ',') {
                    throw new IllegalArgumentException("Koma ',' atau ']' diharapkan pada indeks " + idx);
                }
            }
            return list;
        }

        private String parseString() {
            next(); // consume '"'
            StringBuilder sb = new StringBuilder();
            while (idx < src.length()) {
                char c = src.charAt(idx++);
                if (c == '"') {
                    return sb.toString();
                }
                if (c == '\\') {
                    if (idx >= src.length()) break;
                    char esc = src.charAt(idx++);
                    switch (esc) {
                        case '"': sb.append('"'); break;
                        case '\\': sb.append('\\'); break;
                        case '/': sb.append('/'); break;
                        case 'b': sb.append('\b'); break;
                        case 'f': sb.append('\f'); break;
                        case 'n': sb.append('\n'); break;
                        case 'r': sb.append('\r'); break;
                        case 't': sb.append('\t'); break;
                        case 'u':
                            if (idx + 4 <= src.length()) {
                                String hex = src.substring(idx, idx + 4);
                                idx += 4;
                                sb.append((char) Integer.parseInt(hex, 16));
                            }
                            break;
                        default: sb.append(esc);
                    }
                } else {
                    sb.append(c);
                }
            }
            throw new IllegalArgumentException("String tidak ditutup pada akhir JSON");
        }

        private Boolean parseBoolean() {
            if (src.startsWith("true", idx)) {
                idx += 4;
                return Boolean.TRUE;
            }
            if (src.startsWith("false", idx)) {
                idx += 5;
                return Boolean.FALSE;
            }
            throw new IllegalArgumentException("Nilai boolean tidak valid pada indeks " + idx);
        }

        private Object parseNull() {
            if (src.startsWith("null", idx)) {
                idx += 4;
                return null;
            }
            throw new IllegalArgumentException("Nilai null tidak valid pada indeks " + idx);
        }

        private Number parseNumber() {
            int start = idx;
            if (peek() == '-') idx++;
            while (idx < src.length() && (Character.isDigit(src.charAt(idx)) || src.charAt(idx) == '.' || src.charAt(idx) == 'e' || src.charAt(idx) == 'E' || src.charAt(idx) == '+' || src.charAt(idx) == '-')) {
                idx++;
            }
            String numStr = src.substring(start, idx);
            if (numStr.contains(".") || numStr.contains("e") || numStr.contains("E")) {
                return Double.parseDouble(numStr);
            }
            try {
                return Long.parseLong(numStr);
            } catch (NumberFormatException e) {
                return Double.parseDouble(numStr);
            }
        }
    }
}
