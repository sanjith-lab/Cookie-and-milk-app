package com.sanjith.smscapture;

import android.Manifest;
import android.database.Cursor;
import android.net.Uri;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import org.json.JSONArray;
import org.json.JSONObject;

@CapacitorPlugin(
    name = "SmsCapture",
    permissions = { @Permission(strings = { Manifest.permission.RECEIVE_SMS, Manifest.permission.READ_SMS }, alias = "sms") }
)
public class SmsCapturePlugin extends Plugin {

    @PluginMethod
    public void status(PluginCall call) {
        JSObject r = new JSObject();
        r.put("sms", getPermissionState("sms").toString());
        call.resolve(r);
    }

    @PluginMethod
    public void enable(PluginCall call) {
        if (getPermissionState("sms") == PermissionState.GRANTED) {
            status(call);
            return;
        }
        requestPermissionForAlias("sms", call, "smsPermsCallback");
    }

    @PermissionCallback
    private void smsPermsCallback(PluginCall call) {
        status(call);
    }

    @PluginMethod
    public void getPending(PluginCall call) {
        JSONArray arr = Store.read(getContext());
        JSArray out = new JSArray();
        for (int i = 0; i < arr.length(); i++) {
            JSONObject o = arr.optJSONObject(i);
            if (o != null) out.put(o);
        }
        JSObject r = new JSObject();
        r.put("items", out);
        call.resolve(r);
    }

    @PluginMethod
    public void clear(PluginCall call) {
        JSArray ids = call.getArray("ids");
        if (ids != null) Store.remove(getContext(), ids);
        call.resolve();
    }

    /** Looks back through the inbox (for payments made before the app was set up). */
    @PluginMethod
    public void scanInbox(PluginCall call) {
        if (getPermissionState("sms") != PermissionState.GRANTED) {
            call.reject("SMS permission not granted");
            return;
        }
        Double sinceD = call.getDouble("since");
        long since = sinceD != null ? sinceD.longValue() : System.currentTimeMillis() - 3L * 86400000L;
        JSArray out = new JSArray();
        Cursor c = null;
        try {
            c = getContext().getContentResolver().query(
                Uri.parse("content://sms/inbox"),
                new String[] { "_id", "address", "body", "date" },
                "date > ?",
                new String[] { String.valueOf(since) },
                "date DESC"
            );
            if (c != null) {
                int n = 0;
                while (c.moveToNext() && n < 300) {
                    String body = c.getString(2);
                    if (!SmsFilter.isDebit(body)) continue;
                    JSObject o = new JSObject();
                    o.put("id", "inbox-" + c.getString(0));
                    o.put("sender", c.getString(1));
                    o.put("body", body);
                    o.put("ts", c.getLong(3));
                    out.put(o);
                    n++;
                }
            }
        } catch (Exception e) {
            call.reject("Could not read messages: " + e.getMessage());
            return;
        } finally {
            if (c != null) c.close();
        }
        JSObject r = new JSObject();
        r.put("items", out);
        call.resolve(r);
    }
}
