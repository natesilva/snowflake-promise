"use strict";(self.webpackChunksnowflake_promise_website=self.webpackChunksnowflake_promise_website||[]).push([[2104],{2653:(e,n,o)=>{o.r(n),o.d(n,{assets:()=>a,contentTitle:()=>c,default:()=>h,frontMatter:()=>r,metadata:()=>s,toc:()=>l});const s=JSON.parse('{"id":"migration-guide","title":"Legacy Migration Guide","description":"Migrating From the Legacy API to promisifyConnection","source":"@site/docs/migration-guide.mdx","sourceDirName":".","slug":"/migration-guide","permalink":"/snowflake-promise/docs/migration-guide","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{"id":"migration-guide","title":"Legacy Migration Guide"},"sidebar":"tutorialSidebar","previous":{"title":"Key Implementation Details","permalink":"/snowflake-promise/docs/implementation-details"}}');var i=o(4848),t=o(8453);const r={id:"migration-guide",title:"Legacy Migration Guide"},c="Migration Guide",a={},l=[{value:"Migrating From the Legacy API to <code>promisifyConnection</code>",id:"migrating-from-the-legacy-api-to-promisifyconnection",level:2},{value:"Overview",id:"overview",level:2},{value:"Migration Steps",id:"migration-steps",level:2},{value:"1. Import Changes",id:"1-import-changes",level:3},{value:"2. Connection Creation",id:"2-connection-creation",level:3},{value:"3. Executing Queries",id:"3-executing-queries",level:3},{value:"4. Using Statements",id:"4-using-statements",level:3},{value:"5. SQL Logging",id:"5-sql-logging",level:3},{value:"Complete Example",id:"complete-example",level:2},{value:"Additional Notes",id:"additional-notes",level:2}];function d(e){const n={blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",...(0,t.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.header,{children:(0,i.jsx)(n.h1,{id:"migration-guide",children:"Migration Guide"})}),"\n",(0,i.jsxs)(n.h2,{id:"migrating-from-the-legacy-api-to-promisifyconnection",children:["Migrating From the Legacy API to ",(0,i.jsx)(n.code,{children:"promisifyConnection"})]}),"\n",(0,i.jsxs)(n.p,{children:["This guide explains how to migrate from the legacy compatibility API (using ",(0,i.jsx)(n.code,{children:"Snowflake"})," and ",(0,i.jsx)(n.code,{children:"Statement"})," classes) to the newer ",(0,i.jsx)(n.code,{children:"promisifyConnection"})," API."]}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"Note"}),": The legacy API (",(0,i.jsx)(n.code,{children:"Snowflake"})," and ",(0,i.jsx)(n.code,{children:"Statement"})," classes) remains functional but we recommend using the newer ",(0,i.jsx)(n.code,{children:"promisifyConnection"})," API for new development. This guide helps you migrate to the recommended approach."]}),"\n"]}),"\n",(0,i.jsx)(n.h2,{id:"overview",children:"Overview"}),"\n",(0,i.jsxs)(n.p,{children:["This library package originally provided a Promise-based wrapper around the callback-based portions of the Snowflake SDK through the ",(0,i.jsx)(n.code,{children:"Snowflake"})," and ",(0,i.jsx)(n.code,{children:"Statement"})," classes. These classes are now deprecated in favor of using the standard Snowflake SDK directly with the ",(0,i.jsx)(n.code,{children:"promisifyConnection"})," function."]}),"\n",(0,i.jsx)(n.p,{children:"The newer approach is more aligned with the standard Snowflake SDK."}),"\n",(0,i.jsx)(n.h2,{id:"migration-steps",children:"Migration Steps"}),"\n",(0,i.jsx)(n.h3,{id:"1-import-changes",children:"1. Import Changes"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.strong,{children:"Legacy API:"})}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-typescript",children:'import { Snowflake } from "snowflake-promise";\n'})}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.strong,{children:"New API:"})}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-typescript",children:'import snowflakeSdk from "snowflake-sdk";\nimport { promisifyConnection } from "snowflake-promise";\n'})}),"\n",(0,i.jsx)(n.h3,{id:"2-connection-creation",children:"2. Connection Creation"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.strong,{children:"Legacy API:"})}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-typescript",children:'const snowflake = new Snowflake(\n  {\n    account: "<account name>",\n    username: "<username>",\n    password: "<password>",\n    database: "SNOWFLAKE_SAMPLE_DATA",\n    schema: "TPCH_SF1",\n    warehouse: "DEMO_WH",\n  },\n  {\n    // Optional logging options\n    logLevel: "trace",\n    logSql: console.log,\n  },\n  {\n    // Optional configure options\n    ocspFailOpen: true,\n  },\n);\n\nawait snowflake.connect();\n'})}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.strong,{children:"New API:"})}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-typescript",children:'// Configure the SDK if needed (equivalent to the third parameter\n// in the legacy constructor)\nsnowflakeSdk.configure({\n  ocspFailOpen: true,\n});\n\n// Set log level if needed (part of the second parameter in the\n// legacy constructor)\nif (logLevel) {\n  snowflakeSdk.configure({ logLevel: logLevel });\n}\n\n// Create the connection\nconst connection = snowflakeSdk.createConnection({\n  account: "<account name>",\n  username: "<username>",\n  password: "<password>",\n  database: "SNOWFLAKE_SAMPLE_DATA",\n  schema: "TPCH_SF1",\n  warehouse: "DEMO_WH",\n});\n\n// Promisify the connection\nconst promisifiedConnection = promisifyConnection(connection);\n\n// Connect\nawait promisifiedConnection.connect();\n'})}),"\n",(0,i.jsx)(n.h3,{id:"3-executing-queries",children:"3. Executing Queries"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.strong,{children:"Legacy API:"})}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-typescript",children:'// Simple query execution\nconst rows = await snowflake.execute(\n  "SELECT COUNT(*) FROM CUSTOMER WHERE C_MKTSEGMENT=:1",\n  ["AUTOMOBILE"],\n);\n'})}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.strong,{children:"New API:"})}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-typescript",children:'// Simple query execution\nconst { resultsPromise } = promisifiedConnection.execute({\n  sqlText: "SELECT COUNT(*) FROM CUSTOMER WHERE C_MKTSEGMENT=:1",\n  binds: ["AUTOMOBILE"],\n});\nconst rows = await resultsPromise;\n'})}),"\n",(0,i.jsx)(n.h3,{id:"4-using-statements",children:"4. Using Statements"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.strong,{children:"Legacy API:"})}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-typescript",children:'const statement = snowflake.createStatement({\n  sqlText: "SELECT * FROM CUSTOMER WHERE C_MKTSEGMENT=:1",\n  binds: ["AUTOMOBILE"],\n  streamResult: true,\n});\n\n// Stream rows\nstatement\n  .streamRows({ start: 250, end: 275 })\n  .on("error", console.error)\n  .on("data", (row) => console.log(`customer name is: ${row["C_NAME"]}`))\n  .on("end", () => console.log("done processing"));\n'})}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.strong,{children:"New API:"})}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-typescript",children:'const { statement, resultsPromise } = promisifiedConnection.execute({\n  sqlText: "SELECT * FROM CUSTOMER WHERE C_MKTSEGMENT=:1",\n  binds: ["AUTOMOBILE"],\n  streamResult: true,\n});\n\n// Stream rows\nstatement\n  .streamRows({ start: 250, end: 275 })\n  .on("error", console.error)\n  .on("data", (row) => console.log(`customer name is: ${row["C_NAME"]}`))\n  .on("end", () => console.log("done processing"));\n'})}),"\n",(0,i.jsx)(n.h3,{id:"5-sql-logging",children:"5. SQL Logging"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.strong,{children:"Legacy API:"})}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-typescript",children:"const snowflake = new Snowflake(\n  {\n    // connection options\n  },\n  {\n    logSql: console.log,\n  },\n);\n"})}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.strong,{children:"New API:"})}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-typescript",children:'snowflakeSdk.configure({\n  logLevel: "INFO",\n});\n'})}),"\n",(0,i.jsx)(n.h2,{id:"complete-example",children:"Complete Example"}),"\n",(0,i.jsx)(n.p,{children:"Here\u2019s a complete example showing how to migrate from the legacy API to the new API:"}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.strong,{children:"Legacy API:"})}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-typescript",children:'import { Snowflake } from "snowflake-promise";\n\nasync function main() {\n  const snowflake = new Snowflake(\n    {\n      account: "<account name>",\n      username: "<username>",\n      password: "<password>",\n      database: "SNOWFLAKE_SAMPLE_DATA",\n      schema: "TPCH_SF1",\n      warehouse: "DEMO_WH",\n    },\n    {\n      logSql: console.log,\n    },\n  );\n\n  await snowflake.connect();\n\n  const rows = await snowflake.execute(\n    "SELECT COUNT(*) FROM CUSTOMER WHERE C_MKTSEGMENT=:1",\n    ["AUTOMOBILE"],\n  );\n\n  console.log(rows);\n}\n\nmain();\n'})}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.strong,{children:"New API:"})}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-typescript",children:'import snowflakeSdk from "snowflake-sdk";\nimport { promisifyConnection } from "snowflake-promise";\n\nasync function main() {\n  snowflakeSdk.configure({\n    logLevel: "INFO",\n  });\n\n  // Create the connection\n  const connection = snowflakeSdk.createConnection({\n    account: "<account name>",\n    username: "<username>",\n    password: "<password>",\n    database: "SNOWFLAKE_SAMPLE_DATA",\n    schema: "TPCH_SF1",\n    warehouse: "DEMO_WH",\n  });\n\n  // Promisify the connection\n  const promisifiedConnection = promisifyConnection(connection);\n\n  // Connect\n  await promisifiedConnection.connect();\n\n  // Execute a query\n  const { resultsPromise } = promisifiedConnection.execute({\n    sqlText: "SELECT COUNT(*) FROM CUSTOMER WHERE C_MKTSEGMENT=:1",\n    binds: ["AUTOMOBILE"],\n  });\n\n  // Get the results\n  const rows = await resultsPromise;\n\n  console.log(rows);\n}\n\nmain();\n'})}),"\n",(0,i.jsx)(n.h2,{id:"additional-notes",children:"Additional Notes"}),"\n",(0,i.jsxs)(n.ol,{children:["\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"Error Handling"}),": Both APIs use standard Promise-based error handling with try/catch or .catch() methods."]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"Streaming"}),": The streaming API is similar between both approaches, but the way you obtain the statement object is different."]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"Compatibility"}),": The ",(0,i.jsx)(n.code,{children:"promisifyConnection"})," function maintains backward compatibility with callback-based methods, so you can still use callbacks if needed."]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"Performance"}),": The new API may offer slightly better performance as it has less overhead than the legacy wrapper classes."]}),"\n"]}),"\n"]}),"\n",(0,i.jsxs)(n.p,{children:["By following this guide, you should be able to migrate your existing code from the legacy API to the newer ",(0,i.jsx)(n.code,{children:"promisifyConnection"})," API with minimal effort."]})]})}function h(e={}){const{wrapper:n}={...(0,t.R)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(d,{...e})}):d(e)}},8453:(e,n,o)=>{o.d(n,{R:()=>r,x:()=>c});var s=o(6540);const i={},t=s.createContext(i);function r(e){const n=s.useContext(t);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:r(e.components),s.createElement(t.Provider,{value:n},e.children)}}}]);