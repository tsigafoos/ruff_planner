import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import Icon from '../ui/Icon';
import { useTheme } from '../useTheme';
import { useAuthStore } from '@/store/authStore';
import { testEmailConfig, checkEmail, EmailMessage } from '@/lib/email';
import Input from '../ui/Input';
import Button from '../ui/Button';

export default function EmailTest() {
  const theme = useTheme();
  const { user } = useAuthStore();
  
  const [testEmail, setTestEmail] = useState(user?.email || '');
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [checkError, setCheckError] = useState<string | null>(null);

  const handleTestSend = async () => {
    if (!testEmail) return;
    
    setSending(true);
    setSendResult(null);
    
    try {
      const result = await testEmailConfig(testEmail);
      setSendResult(result);
    } catch (error: any) {
      setSendResult({ success: false, error: error.message });
    } finally {
      setSending(false);
    }
  };

  const handleCheckEmail = async () => {
    setChecking(true);
    setCheckError(null);
    setEmails([]);
    
    try {
      const result = await checkEmail({ limit: 5 });
      if (result.success) {
        setEmails(result.emails);
      } else {
        setCheckError(result.error || 'Failed to check email');
      }
    } catch (error: any) {
      setCheckError(error.message);
    } finally {
      setChecking(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        <Icon name="envelope" size={18} color={theme.primary} /> Email Test
      </Text>
      
      <Text style={[styles.description, { color: theme.textSecondary }]}>
        Test your email configuration. Make sure you've set up SMTP and IMAP in Team Settings first.
      </Text>

      {/* Send Test Section */}
      <View style={styles.testSection}>
        <Text style={[styles.subsectionTitle, { color: theme.text }]}>
          <Icon name="send" size={14} color={theme.textSecondary} /> Send Test Email
        </Text>
        
        <View style={styles.inputRow}>
          <View style={styles.inputFlex}>
            <Input
              label="Send to"
              value={testEmail}
              onChangeText={setTestEmail}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.buttonContainer}>
            <Button
              title={sending ? 'Sending...' : 'Send Test'}
              onPress={handleTestSend}
              disabled={!testEmail || sending}
              loading={sending}
            />
          </View>
        </View>

        {sendResult && (
          <View style={[
            styles.resultBox,
            { 
              backgroundColor: sendResult.success ? theme.success + '15' : theme.error + '15',
              borderColor: sendResult.success ? theme.success : theme.error,
            }
          ]}>
            <Icon 
              name={sendResult.success ? 'check-circle' : 'times-circle'} 
              size={16} 
              color={sendResult.success ? theme.success : theme.error} 
            />
            <Text style={[
              styles.resultText,
              { color: sendResult.success ? theme.success : theme.error }
            ]}>
              {sendResult.success 
                ? sendResult.message || 'Email sent successfully!' 
                : sendResult.error || 'Failed to send email'}
            </Text>
          </View>
        )}
      </View>

      {/* Check Email Section */}
      <View style={[styles.testSection, styles.testSectionBorder, { borderTopColor: theme.border }]}>
        <Text style={[styles.subsectionTitle, { color: theme.text }]}>
          <Icon name="inbox" size={14} color={theme.textSecondary} /> Check Inbox
        </Text>
        
        <Button
          title={checking ? 'Checking...' : 'Check Inbox (IMAP)'}
          variant="secondary"
          onPress={handleCheckEmail}
          disabled={checking}
          loading={checking}
        />

        {checkError && (
          <View style={[styles.resultBox, { backgroundColor: theme.error + '15', borderColor: theme.error }]}>
            <Icon name="times-circle" size={16} color={theme.error} />
            <Text style={[styles.resultText, { color: theme.error }]}>{checkError}</Text>
          </View>
        )}

        {emails.length > 0 && (
          <View style={styles.emailList}>
            <Text style={[styles.emailListTitle, { color: theme.textSecondary }]}>
              Recent emails ({emails.length}):
            </Text>
            {emails.map((email, index) => (
              <View 
                key={email.id || index} 
                style={[styles.emailItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
              >
                <Text style={[styles.emailFrom, { color: theme.text }]} numberOfLines={1}>
                  {email.from}
                </Text>
                <Text style={[styles.emailSubject, { color: theme.textSecondary }]} numberOfLines={1}>
                  {email.subject}
                </Text>
                <Text style={[styles.emailDate, { color: theme.textTertiary }]}>
                  {email.date}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Note */}
      <View style={[styles.noteBox, { backgroundColor: theme.warning + '10', borderColor: theme.warning + '30' }]}>
        <Icon name="info-circle" size={14} color={theme.warning} />
        <Text style={[styles.noteText, { color: theme.textSecondary }]}>
          Email functions require Supabase Edge Functions to be deployed. See /supabase/functions/ for deployment instructions.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Platform.OS === 'web' ? 20 : 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: Platform.OS === 'web' ? 18 : 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 20,
  },
  testSection: {
    marginBottom: 16,
  },
  testSectionBorder: {
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 1,
  },
  subsectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 12,
    alignItems: Platform.OS === 'web' ? 'flex-end' : 'stretch',
  },
  inputFlex: {
    flex: 1,
  },
  buttonContainer: {
    paddingBottom: Platform.OS === 'web' ? 0 : 0,
  },
  resultBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
  },
  resultText: {
    fontSize: 14,
    flex: 1,
  },
  emailList: {
    marginTop: 12,
  },
  emailListTitle: {
    fontSize: 13,
    marginBottom: 8,
  },
  emailItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  emailFrom: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  emailSubject: {
    fontSize: 13,
    marginBottom: 4,
  },
  emailDate: {
    fontSize: 12,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  noteText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
});
