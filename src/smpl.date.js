if (typeof define !== 'function') {var define = require('amdefine')(module)}
/**
 * @module smpl
 * @submodule smpl.date
 * @class smpl.date
 * @static
 */
define(['./smpl.core'], function(smpl) {
	smpl.date = {};
	
	smpl.date.MS_IN_DAY = 86400000;
	
	/**
	 * Compute the difference between to dates in days.
	 * 
	 *     smpl.date.diff(new Date(2000, 1, 1, 0, 0), new Date(2000, 1, 2, 0, 0)) === 1
	 *     smpl.date.diff(new Date(2000, 1, 1, 23, 59), new Date(2000, 1, 2, 0, 0)) === 1
	 * 
	 * @method diff
	 * 
	 * @param date1 {Date} the first date
	 * @param date2 {Date} the second date
	 * @return {integer} The difference in days between both dates. The value is positive if date1 is later than date2
	 */
	smpl.date.diff = function(date1, date2) {
		date1 = new Date(date1.getTime());
		date2 = new Date(date2.getTime());
		
		date1.setHours(12, 0, 0, 0);
		date2.setHours(12, 0, 0, 0);
		
		return Math.round((date2.getTime() - date1.getTime()) / smpl.date.MS_IN_DAY); // Round to avoid DST issues.
	};
	
	/**
	 * Shift a given date by a number of days. The original date is modified.
	 * 
	 * @method shift
	 * 
	 * @param date {Date} the date to modify
	 * @param days {integer} The number of days to shift. If positive, the date is moved to the future.
	 * @return {Date} `date`
	 */
	smpl.date.shift = function(date, days) {
		date.setDate(date.getDate() + days);
		return date;
	};
	
	/**
	 * Shift a given date by a number of months. The original date is modified.
	 * 
	 * Note: if the new month is shorter than the original month, the date is adapted:
	 * 
	 *     smpl.date.shiftMonth(new Date(2000, 0, 31)).getTime() === new Date(2000, 1, 29).getTime()
	 * 
	 * @method shiftMonth
	 * 
	 * @param date {Date} the date to modify
	 * @param months {integer} The number of months to shift. If positive, the date is moved to the future.
	 * @return {Date} `date`
	 */
	smpl.date.shiftMonth = function(date, months) {
		var dom = date.getDate();
		date.setMonth(date.getMonth() + months);
		if (dom !== date.getDate()) {
			date.setDate(0);
		}
		return date;
	};
	
	/**
	 * Clone a `Date` object
	 * 
	 * @method clone
	 * 
	 * @param date {Date} the date to clone
	 * @return {Date} a new date with the same value as `date`
	 */
	smpl.date.clone = function(date) {
		return new Date(date.getTime());
	};
	
	/**
	 * Return the last day of the month. All parameters of the new date are equals to the original one except the day
	 * of the month.
	 * 
	 * @method lastDayOfMonth
	 * 
	 * @param date {Date} The reference date
	 * @return {Date} the new date
	 */
	smpl.date.lastDayOfMonth = function(date) {
		date = smpl.date.clone(date);
		date.setDate(1);
		date.setMonth(date.getMonth() + 1);
		date.setDate(0);
		return date;
	};
	
});