// Email Service for BarkItDone
// Provides send/receive capabilities via Supabase Edge Functions

import { supabase } from '../supabase/client';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  body: string;
  html?: string;
  from?: string;
}

export interface EmailMessage {
  id: string;
  from: string;
  subject: string;
  date: string;
  preview: string;
  body?: string;
}

export interface CheckEmailResult {
  success: boolean;
  folder: string;
  total: number;
  emails: EmailMessage[];
}

export interface SendEmailResult {
  success: boolean;
  message?: string;
  error?: string;
  details?: string;
}

/**
 * Send an email using the user's configured SMTP settings
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  try {
    // Get current session for auth token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return { success: false, error: 'Not authenticated. Please log in.' };
    }

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/send-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(options),
      }
    );

    const result = await response.json();
    
    if (!response.ok) {
      return { 
        success: false, 
        error: result.error || 'Failed to send email',
        details: result.details,
      };
    }

    return result;
  } catch (error: any) {
    console.error('Email send error:', error);
    return { 
      success: false, 
      error: 'Network error while sending email',
      details: error.message,
    };
  }
}

/**
 * Check for new emails using the user's configured IMAP settings
 */
export async function checkEmail(
  options: { limit?: number; folder?: string } = {}
): Promise<CheckEmailResult & { error?: string }> {
  try {
    const { limit = 10, folder = 'INBOX' } = options;
    
    // Get current session for auth token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return { 
        success: false, 
        folder: '',
        total: 0,
        emails: [],
        error: 'Not authenticated. Please log in.',
      };
    }

    const params = new URLSearchParams({ 
      limit: limit.toString(), 
      folder 
    });

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/check-email?${params}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      }
    );

    const result = await response.json();
    
    if (!response.ok) {
      return { 
        success: false, 
        folder: '',
        total: 0,
        emails: [],
        error: result.error || 'Failed to check email',
      };
    }

    return result;
  } catch (error: any) {
    console.error('Email check error:', error);
    return { 
      success: false, 
      folder: '',
      total: 0,
      emails: [],
      error: 'Network error while checking email',
    };
  }
}

/**
 * Test email configuration by sending a test email to the user
 */
export async function testEmailConfig(toAddress: string): Promise<SendEmailResult> {
  return sendEmail({
    to: toAddress,
    subject: 'BarkItDone - Email Test',
    body: `This is a test email from BarkItDone.

If you're reading this, your SMTP settings are configured correctly!

Sent at: ${new Date().toLocaleString()}

---
BarkItDone - No more excuses.`,
  });
}

/**
 * Send a project request notification email
 */
export async function sendProjectRequestEmail(
  to: string,
  projectName: string,
  dueDate: string,
  requesterEmail: string
): Promise<SendEmailResult> {
  return sendEmail({
    to,
    subject: `New Project Request: ${projectName}`,
    body: `A new project has been requested.

Project: ${projectName}
Requested By: ${requesterEmail}
Due Date: ${dueDate}

Log in to BarkItDone to review and accept this request.

---
Sent by BarkItDone. No more excuses.`,
  });
}

/**
 * Send a daily status report email
 */
export async function sendDailyBarkEmail(
  to: string,
  stats: {
    projectsTotal: number;
    tasksNew: number;
    tasksDone: number;
    tasksOverdue: { title: string; dueDate: string }[];
  }
): Promise<SendEmailResult> {
  const overdueList = stats.tasksOverdue.length > 0
    ? stats.tasksOverdue.map((t, i) => `${i + 1}. ${t.title} (due: ${t.dueDate})`).join('\n')
    : 'None! Great job.';

  return sendEmail({
    to,
    subject: `Daily Bark - ${new Date().toLocaleDateString()}`,
    body: `Good morning! Here's your daily bark.

PROJECTS: ${stats.projectsTotal} total

TASKS:
- New today: ${stats.tasksNew}
- Completed: ${stats.tasksDone}
- Overdue: ${stats.tasksOverdue.length}

OVERDUE TASKS:
${overdueList}

---
Sent by BarkItDone. No more excuses.`,
  });
}

/**
 * Send a meeting recap email
 */
export async function sendMeetingRecapEmail(
  to: string[],
  meeting: {
    title: string;
    date: string;
    attendees: string[];
    decisions: string[];
    actions: { assignee: string; task: string; dueDate: string }[];
    notes: string;
  }
): Promise<SendEmailResult> {
  const attendeesList = meeting.attendees.join(', ');
  const decisionsList = meeting.decisions.length > 0
    ? meeting.decisions.map((d, i) => `${i + 1}. ${d}`).join('\n')
    : 'None recorded.';
  const actionsList = meeting.actions.length > 0
    ? meeting.actions.map((a, i) => `${i + 1}. ${a.assignee}: ${a.task} (by ${a.dueDate})`).join('\n')
    : 'None assigned.';

  return sendEmail({
    to,
    subject: `Meeting Recap: ${meeting.title}`,
    body: `Meeting: ${meeting.title}
Date: ${meeting.date}
Attendees: ${attendeesList}

DECIDED:
${decisionsList}

ACTIONS:
${actionsList}

NOTES:
${meeting.notes || 'None.'}

---
Sent by BarkItDone. No more excuses.`,
  });
}
