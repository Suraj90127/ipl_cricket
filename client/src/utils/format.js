const opts = { hour: '2-digit', minute: '2-digit' };

const asDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const format = {
  date: (value) => {
    const d = asDate(value);
    if (!d) return '--';
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  },
  time: (value) => {
    const d = asDate(value);
    if (!d) return '--:--';
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  },
  dateTime: (value) => {
    const d = asDate(value);
    if (!d) return '--/--/---- --:--';
    const date = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    return `${date} ${time}`;
  }
};
