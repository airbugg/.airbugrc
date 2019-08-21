export async function rpcExe(bindedFunction: Function, recRequest: any) {
  try {
    return bindedFunction(recRequest);
  } catch (e) {
    console.error(`rpc Failed with recRequest ${recRequest} exception:`, e);
    throw e;
  }
}

export function makeLogged(fn) {
  return function(...params): any {
    // print arguments
    if (process.env.NODE_ENV !== 'test') {
      console.log(`${fn.name} log::`);
      for (const argument of arguments) {
        try {
          console.log(`argument: ${JSON.stringify(argument)}`);
        } catch {
          console.log(`argument : ${argument}`);
        }
      }
    }

    const retPromise = fn.apply(this, arguments);

    // print returned value
    if (process.env.NODE_ENV !== 'test') {
      retPromise.then(returnedValue => {
        try {
          console.log(`${fn.name} returned: ${JSON.stringify(returnedValue)}`);
        } catch {
          console.log(`${fn.name} returned: ${returnedValue}`);
        }
      });
    }
    return retPromise;
  };
}
