import { createNotification } from '@/lib/db';

export async function notifyApplicationStatusChanged(
  userId: string,
  scholarshipTitle: string,
  oldStatus: string,
  newStatus: string,
  scholarshipId: string
) {
  if (oldStatus === newStatus) return;

  const statusLabels: Record<string, string> = {
    not_started: 'Not started',
    researching: 'Researching',
    drafting: 'Drafting',
    submitted: 'Submitted',
    awarded: 'Awarded',
    rejected: 'Rejected',
  };

  const title = `Application status updated`;
  const message = `Your application for "${scholarshipTitle}" changed from ${statusLabels[oldStatus] ?? oldStatus} to ${statusLabels[newStatus] ?? newStatus}.`;

  await createNotification(userId, {
    title,
    message,
    type: 'status',
    link: `/scholarships/${scholarshipId}`,
  });
}

export async function notifyApplicationSubmitted(
  userId: string,
  scholarshipTitle: string,
  scholarshipId: string
) {
  await createNotification(userId, {
    title: 'Application submitted!',
    message: `You've submitted your application for "${scholarshipTitle}". Good luck!`,
    type: 'status',
    link: `/scholarships/${scholarshipId}`,
  });
}

export async function notifyApplicationAwarded(
  userId: string,
  scholarshipTitle: string,
  scholarshipId: string
) {
  await createNotification(userId, {
    title: 'Congratulations!',
    message: `Your application for "${scholarshipTitle}" has been awarded!`,
    type: 'status',
    link: `/scholarships/${scholarshipId}`,
  });
}

export async function notifyDeadlineApproaching(
  userId: string,
  scholarshipTitle: string,
  daysLeft: number,
  scholarshipId: string
) {
  const dayText = daysLeft === 1 ? 'day' : 'days';
  await createNotification(userId, {
    title: 'Deadline approaching',
    message: `"${scholarshipTitle}" deadline is in ${daysLeft} ${dayText}. Don't miss it!`,
    type: 'deadline',
    link: `/scholarships/${scholarshipId}`,
  });
}
