import cron from 'node-cron';

class CronService {
    static oneMinuteJob(d: Array<() => void>) {
        cron.schedule('* * * * *', () => {
            d.forEach(ds => {
                ds();
            })
          });
    }
    
    static wednesdayJob(d: Array<() => void>) {
        // hour is in 24 hours
        cron.schedule('0 0 19 * * Wednesday', () => {
            d.forEach(ds => {
                ds();
            })
          }, {
            scheduled: true,
            timezone: "America/New_York"
          });
    }

    static fridayJob(d: Array<() => void>) {
        // hour is in 24 hours
        cron.schedule('0 0 12 * * Friday', () => {
            d.forEach(ds => {
                ds();
            })
          },{
            scheduled: true,
            timezone: "America/New_York"
          });
    }

    static mondayJob(d: Array<() => void>) {
        // hour is in 24 hours
        cron.schedule('0 0 14 * * Mon', () => {
            d.forEach(ds => {
                ds();
            })
          }, {
            scheduled: true,
            timezone: "America/New_York"
          });
    }

    static sundayJob(d: Array<() => void>) {
        cron.schedule('0 0 19 * * Sunday', () => {
            d.forEach(ds => {
                ds();
            })
          }, {
            scheduled: true,
            timezone: "America/New_York"
          });
    }
}

export default CronService;