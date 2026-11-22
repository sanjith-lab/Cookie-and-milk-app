package com.sanjith.smscapture;

import android.content.Context;
import android.content.SharedPreferences;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/** Captured payments waiting for the user, kept until the app has shown them. */
public final class Store {
    private static final String PREFS = "cookie_sms_capture";
    private static final String KEY = "pending";
    private static final int MAX = 200;

    private Store() {}

    public static synchronized JSONArray read(Context ctx) {
        SharedPreferences sp = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        try {
            return new JSONArray(sp.getString(KEY, "[]"));
        } catch (JSONException e) {
            return new JSONArray();
        }
    }

    private static void write(Context ctx, JSONArray arr) {
        ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(KEY, arr.toString()).apply();
    }

    public static synchronized boolean add(Context ctx, String id, String sender, String body, long ts) {
        JSONArray arr = read(ctx);
        for (int i = 0; i < arr.length(); i++) {
            JSONObject o = arr.optJSONObject(i);
            if (o != null && id.equals(o.optString("id"))) return false;
        }
        try {
            JSONObject o = new JSONObject();
            o.put("id", id);
            o.put("sender", sender == null ? "" : sender);
            o.put("body", body);
            o.put("ts", ts);
            arr.put(o);
        } catch (JSONException e) {
            return false;
        }
        JSONArray out = arr;
        if (arr.length() > MAX) {
            out = new JSONArray();
            for (int i = arr.length() - MAX; i < arr.length(); i++) out.put(arr.opt(i));
        }
        write(ctx, out);
        return true;
    }

    public static synchronized void remove(Context ctx, JSONArray ids) {
        JSONArray arr = read(ctx);
        JSONArray out = new JSONArray();
        for (int i = 0; i < arr.length(); i++) {
            JSONObject o = arr.optJSONObject(i);
            if (o == null) continue;
            boolean drop = false;
            for (int j = 0; j < ids.length(); j++) {
                if (o.optString("id").equals(ids.optString(j))) { drop = true; break; }
            }
            if (!drop) out.put(o);
        }
        write(ctx, out);
    }
}
