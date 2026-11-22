package com.sanjith.smscapture;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

/** "Cookie spotted a payment" notification. Tapping it opens the app, where the payment waits in the chat. */
public final class Notifier {
    private static final String CHANNEL = "cookie_payments";

    private Notifier() {}

    public static void show(Context ctx, String id, String amount, String payee) {
        try {
            NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && nm != null) {
                NotificationChannel ch = new NotificationChannel(CHANNEL, "Payments Cookie spotted", NotificationManager.IMPORTANCE_DEFAULT);
                ch.setDescription("Asks you to add UPI and card payments to your expenses");
                nm.createNotificationChannel(ch);
            }
            Intent open = ctx.getPackageManager().getLaunchIntentForPackage(ctx.getPackageName());
            if (open == null) return;
            open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            open.putExtra("cookieCapture", id);
            int flags = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0);
            PendingIntent pi = PendingIntent.getActivity(ctx, id.hashCode(), open, flags);

            String title = amount.isEmpty() ? "Cookie spotted a payment" : "\u20b9" + amount + (payee.isEmpty() ? " paid" : " paid to " + payee);
            int icon = ctx.getResources().getIdentifier("ic_stat_cookie", "drawable", ctx.getPackageName());
            if (icon == 0) icon = ctx.getApplicationInfo().icon;
            NotificationCompat.Builder b = new NotificationCompat.Builder(ctx, CHANNEL)
                    .setSmallIcon(icon)
                    .setContentTitle(title)
                    .setContentText("Tap to add it to your expenses \uD83C\uDF6A")
                    .setAutoCancel(true)
                    .setContentIntent(pi)
                    .setPriority(NotificationCompat.PRIORITY_DEFAULT);
            NotificationManagerCompat.from(ctx).notify(id.hashCode(), b.build());
        } catch (SecurityException ignored) {
            // Notifications not allowed: the payment still waits in the app.
        } catch (Exception ignored) {
        }
    }
}
