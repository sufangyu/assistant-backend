/// <reference types="node" />

// // declare global {
// //   namespace NodeJS {
// //     export interface ProcessEnv {
// //       readonly MYSQL_HOST: string;
// //     }
// //   }
// // }

// // export {};

// export interface ProcessEnv {
//   readonly MYSQL_HOST: string;
// }

declare namespace NodeJS {
  interface ProcessEnv {
    readonly MYSQL_HOST: string;
  }

  interface User {
    readonly name: string;
  }
}

export {};
