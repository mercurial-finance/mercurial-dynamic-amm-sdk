import { createProgram } from './utils';
import { IDL, Amm } from '../amm/idl';
import { AnchorError, ProgramError } from '@project-serum/anchor';
import { PROGRAM_ID } from './constants';

type Codes = (typeof IDL.errors)[number]['code'];

class DynamicAmmError extends Error {
  public errorCode: number;
  public errorName: string;
  public errorMessage: string;

  constructor(error: object | Codes) {
    let _errorCode = 0;
    let _errorName = 'Something went wrong';
    let _errorMessage = 'Something went wrong';

    let errorCode;
    if (typeof error === 'object') {
      const anchorError = AnchorError.parse(JSON.parse(JSON.stringify(error)).logs as string[]);

      if (anchorError?.program.toBase58() === PROGRAM_ID) errorCode = anchorError?.error.errorCode;
    }

    const idlError = IDL.errors.find((err) => err.code === errorCode);

    if (idlError) {
      _errorCode = idlError.code;
      _errorName = idlError.name;
      _errorMessage = idlError.msg;
    }

    super(_errorMessage);

    this.errorCode = _errorCode;
    this.errorName = _errorName;
    this.errorMessage = _errorMessage;
  }
}

export default DynamicAmmError;
