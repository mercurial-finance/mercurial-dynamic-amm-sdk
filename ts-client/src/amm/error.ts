class DynamicAmmError extends Error {
  public errorNumber: number;
  public errorCode: string;
  public errorDescription;

  constructor(error: object) {
    const logs = JSON.parse(JSON.stringify(error));
    const errorLog = logs.find((log) => log.includes('AnchorError'));
    const errorNumber = errorLog.match(/Error Number: (\d+)/)[1];
    const errorCode = errorLog.match(/Error Code: (\w+)/)[1];
    const errorDescription = errorLog.match(/Error Message: (\w+)/)[1];

    super(errorDescription);

    this.errorNumber = errorNumber;
    this.errorCode = errorCode;
    this.errorDescription = errorDescription;
  }
}

export default DynamicAmmError;
