// utils/timezonePlugin.js
module.exports = function timezonePlugin(schema) {
  schema.methods.toJSON = function () {
    const obj = this.toObject({ virtuals: true });

    const toLondonTime = (date) =>
      date
        ? new Date(date).toLocaleString('en-GB', { timeZone: 'Europe/London' })
        : date;

    Object.keys(obj).forEach((key) => {
      if (obj[key] instanceof Date) {
        obj[key] = toLondonTime(obj[key]);
      }
    });

    if (obj.createdAt) obj.createdAt = toLondonTime(obj.createdAt);
    if (obj.updatedAt) obj.updatedAt = toLondonTime(obj.updatedAt);

    return obj;
  };
};
