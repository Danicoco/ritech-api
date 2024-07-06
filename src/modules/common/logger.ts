import winston from 'winston';

class Logger {
	private static info = (type: string, level: string) =>
		winston.createLogger({
			level: level,
			format: winston.format.json(),
			defaultMeta: { service: type },
			transports: [
				new winston.transports.File({ filename: 'info.log', level: 'info' }),
				new winston.transports.File({ filename: 'error.log', level: 'error' }),
			]
		});

	static addLog (
		level: 'info' | 'error' | 'success',
		type: string,
		data: Record<string, any>
	) {
		return this.info(type, level).log({ level, message: JSON.stringify(data), date: new Date().toISOString() });
	};
}

export default Logger;
