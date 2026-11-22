package com.sanjith.smscapture;

import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Quick native check so only real debit messages wake Cookie up. The app re-reads the text in detail. */
public final class SmsFilter {
    private static final Pattern AMOUNT = Pattern.compile("(?:rs\\.?|inr|\u20b9)\\s*([0-9,]+(?:\\.[0-9]{1,2})?)", Pattern.CASE_INSENSITIVE);
    private static final Pattern PAYEE = Pattern.compile("(?:\\bto|\\bat|towards|paid to|sent to)\\s+(?:vpa\\s+)?([A-Za-z0-9][A-Za-z0-9 .&@'\\-]{1,28}?)(?=\\s+(?:on|ref|upi|via|from|avl|a/c|bal|thru|using|for)\\b|[.\\n,]|$)", Pattern.CASE_INSENSITIVE);

    private SmsFilter() {}

    public static boolean isDebit(String body) {
        if (body == null) return false;
        String b = body.toLowerCase(Locale.ROOT);
        if (b.contains("otp") || b.contains("one time password") || b.contains("verification code")) return false;
        if (b.contains("will be debited") || b.contains("to be debited") || b.contains("is due") || b.contains("amount due")
                || b.contains("requested") || b.contains("mandate") || b.contains("failed") || b.contains("declined") || b.contains("reversed")) return false;
        boolean debit = b.contains("debited") || b.contains("debit") || b.contains("spent") || b.contains("sent") || b.contains("paid")
                || b.contains("withdrawn") || b.contains("txn") || b.contains("transferred") || b.contains("purchase");
        if (!debit) return false;
        if (b.contains("credited") && !(b.contains("debited") || b.contains("spent") || b.contains("sent") || b.contains("paid") || b.contains("purchase"))) return false;
        return AMOUNT.matcher(body).find();
    }

    public static String amount(String body) {
        Matcher m = AMOUNT.matcher(body == null ? "" : body);
        return m.find() ? m.group(1).replace(",", "") : "";
    }

    public static String payee(String body) {
        Matcher m = PAYEE.matcher(body == null ? "" : body);
        if (!m.find()) return "";
        String p = m.group(1).trim();
        if (p.contains("@")) {
            p = p.substring(0, p.indexOf('@')).replaceAll("[._\\-]?\\d{4,}$", "").replaceAll("[._\\-]+", " ").trim();
        }
        if (p.isEmpty()) return "";
        return p.length() > 24 ? p.substring(0, 24) : p;
    }
}
