import { createProgram } from './utils';
import { IDL, Amm } from '../amm/idl';
import { ProgramError } from '@project-serum/anchor';

type Codes = (typeof IDL.errors)[number]['code'];

// class DynamicAmmError extends Error {
//   public errorCode: number;
//   public errorName: string;
//   public errorMessage: string;

//   constructor(error: object | Codes) {
//     let _errorCode = 0;
//     let _errorName = 'Something went wrong';
//     let _errorMessage = 'Something went wrong';

//     if (typeof error !== 'object') {
//       const error = IDL.errors.find((err) => err.code === error);

//       if (error) {
//         _errorCode = error.code;
//         _errorName = error.name;
//         _errorMessage = error.msg;
//       }
//     } else {
//       const { logs } = JSON.parse(JSON.stringify(error));
//       const errorLog = logs.find((log) => log.includes('AnchorError'));
//       _errorCode = errorLog.match(/Error Number: (\d+)/)[1];
//       _errorName = errorLog.match(/Error Code: (\w+)/)[1];
//       _errorMessage = errorLog.match(/Error Message: (.*?)(?=\.)/)[1];
//     }

//     super(_errorMessage);

//     this.errorCode = _errorCode;
//     this.errorName = _errorName;
//     this.errorMessage = _errorMessage;
//   }
// }

class DynamicAmmError extends Error {
  public errorCode?: number;
  public errorName?: string;
  public errorMessage?: string;

  constructor(error: any) {
    const programError = ProgramError.parse(
      error,
      IDL.errors.reduce((acc, err) => {
        acc.set(err.code, err.msg);
        return acc;
      }, new Map()),
    );

    super(programError?.msg);

    this.errorCode = programError?.code;
    this.errorName = programError?.name;
    this.errorMessage = programError?.message;
  }
}

export default DynamicAmmError;
