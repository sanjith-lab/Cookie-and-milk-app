package com.sanjith.smscapture;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.provider.Telephony;
import android.telephony.SmsMessage;

/** Runs even when the app is closed: keeps debit SMS and pings the user. */
public class SmsReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context ctx, Intent intent) {
        if (intent == null || !Telephony.Sms.Intents.SMS_RECEIVED_ACTION.equals(intent.getAction())) return;
        SmsMessage[] msgs = Telephony.Sms.Intents.getMessagesFromIntent(intent);
        if (msgs == null || msgs.length == 0) return;
        StringBuilder sb = new StringBuilder();
        for (SmsMessage m : msgs) {
            if (m != null && m.getMessageBody() != null) sb.append(m.getMessageBody());
        }
        String body = sb.toString();
        if (!SmsFilter.isDebit(body)) return;
        String sender = msgs[0].getOriginatingAddress();
        long ts = msgs[0].getTimestampMillis();
        String id = "rx-" + ts + "-" + Math.abs(body.hashCode());
        if (Store.add(ctx, id, sender, body, ts)) {
            Notifier.show(ctx, id, SmsFilter.amount(body), SmsFilter.payee(body));
        }
    }
}
