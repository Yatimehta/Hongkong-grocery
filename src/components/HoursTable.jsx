import React from 'react';

const HOURS = [
  { day: 'Monday', hours: '05:00 – 05:00', note: '(24 hours)' },
  { day: 'Tuesday', hours: '11:00 – 17:00', note: '' },
  { day: 'Wednesday', hours: '11:00 – 17:00', note: '' },
  { day: 'Thursday', hours: '11:00 – 17:00', note: '' },
  { day: 'Friday', hours: '15:00 – 17:00', note: '' },
  { day: 'Saturday', hours: '11:00 – 17:00', note: '' },
  { day: 'Sunday', hours: '11:00 – 17:00', note: '' },
];

function getCurrentDay() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
}

export default function HoursTable({ compact = false }) {
  const today = getCurrentDay();

  return (
    <table className="hours-table" style={{
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: '0 4px',
      fontSize: compact ? 'var(--font-size-sm)' : 'var(--font-size-base)',
    }}>
      <tbody>
        {HOURS.map(({ day, hours, note }) => {
          const isToday = day === today;
          return (
            <tr key={day} style={{
              background: isToday ? 'var(--color-primary-50)' : 'transparent',
              borderRadius: 'var(--radius-sm)',
            }}>
              <td style={{
                padding: compact ? '6px 10px' : '10px 14px',
                fontWeight: isToday ? 700 : 500,
                color: isToday ? 'var(--color-primary-dark)' : 'var(--color-text)',
                borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)',
                whiteSpace: 'nowrap',
              }}>
                {day}
                {isToday && <span style={{
                  marginLeft: 8,
                  fontSize: 'var(--font-size-xs)',
                  background: 'var(--color-primary)',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 600,
                }}>Today</span>}
              </td>
              <td style={{
                padding: compact ? '6px 10px' : '10px 14px',
                textAlign: 'right',
                color: isToday ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
                fontWeight: isToday ? 600 : 400,
                borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                whiteSpace: 'nowrap',
              }}>
                {hours}
                {note && <span style={{
                  marginLeft: 6,
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                }}>{note}</span>}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
