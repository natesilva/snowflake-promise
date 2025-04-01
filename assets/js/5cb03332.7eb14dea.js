"use strict";(self.webpackChunksnowflake_promise_website=self.webpackChunksnowflake_promise_website||[]).push([[7804],{6014:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>a,contentTitle:()=>l,default:()=>d,frontMatter:()=>o,metadata:()=>t,toc:()=>c});const t=JSON.parse('{"id":"examples/executing-queries/query-example-1","title":"Example: Basic Query","description":"Documentation","source":"@site/docs/examples/executing-queries/query-example-1.mdx","sourceDirName":"examples/executing-queries","slug":"/examples/executing-queries/query-example-1","permalink":"/snowflake-promise/docs/examples/executing-queries/query-example-1","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{"id":"query-example-1","title":"Example: Basic Query"},"sidebar":"tutorialSidebar","previous":{"title":"Executing Queries","permalink":"/snowflake-promise/docs/examples/executing-queries/"},"next":{"title":"Example: Streaming Query","permalink":"/snowflake-promise/docs/examples/executing-queries/query-example-2"}}');var r=s(4848),i=s(8453);const o={id:"query-example-1",title:"Example: Basic Query"},l=void 0,a={},c=[{value:"Documentation",id:"documentation",level:2},{value:"Prerequisites",id:"prerequisites",level:2},{value:"Steps",id:"steps",level:2},{value:"Example Code: Basic Query",id:"example-code-basic-query",level:2},{value:"Example Code: Basic Query with TypeScript Interface",id:"example-code-basic-query-with-typescript-interface",level:2}];function u(e){const n={a:"a",code:"code",h2:"h2",li:"li",ol:"ol",p:"p",pre:"pre",ul:"ul",...(0,i.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.h2,{id:"documentation",children:"Documentation"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsx)(n.li,{children:(0,r.jsx)(n.a,{href:"https://docs.snowflake.com/en/developer-guide/node-js/nodejs-driver-execute",children:"Snowflake SDK Documentation"})}),"\n"]}),"\n",(0,r.jsx)(n.h2,{id:"prerequisites",children:"Prerequisites"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:["You\u2019ve ",(0,r.jsx)(n.a,{href:"../../connecting",children:"established a connection"})," to Snowflake and promisified it using the ",(0,r.jsx)(n.code,{children:"snowflake-promise"})," library."]}),"\n"]}),"\n",(0,r.jsx)(n.h2,{id:"steps",children:"Steps"}),"\n",(0,r.jsxs)(n.ol,{children:["\n",(0,r.jsx)(n.li,{children:"Execute the query."}),"\n",(0,r.jsx)(n.li,{children:"Await the results."}),"\n"]}),"\n",(0,r.jsx)(n.h2,{id:"example-code-basic-query",children:"Example Code: Basic Query"}),"\n",(0,r.jsxs)(n.p,{children:["To make your queries maintainable and to prevent SQL injection attacks, don\u2019t concatenate data into SQL strings. Instead, use ",(0,r.jsx)(n.code,{children:"binds"}),"."]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-typescript",children:"const { resultsPromise } = await connection.execute({\n  sqlText: `\n    SELECT COUNT(*) AS QTY\n    FROM SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.CUSTOMER\n    WHERE C_MKTSEGMENT = :1;\n  `,\n  binds: ['AUTOMOBILE']\n});\nconst results = await resultsPromise;\nconsole.log(results); // prints: [ { QTY: 29752 } ]\n"})}),"\n",(0,r.jsx)(n.h2,{id:"example-code-basic-query-with-typescript-interface",children:"Example Code: Basic Query with TypeScript Interface"}),"\n",(0,r.jsxs)(n.p,{children:["In this query we\u2019re passing the expected row type as an ",(0,r.jsx)(n.code,{children:"interface"})," and getting back strongly-typed results."]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-typescript",children:'// The expected row type for the query results\ninterface CustomerCount {\n  C_MKTSEGMENT: string;\n  QTY: number;\n}\n\n// Pass <CustomerCount> to the execute method\nconst { resultsPromise } = await connection.execute<CustomerCount>({\n  sqlText: `\n    SELECT C_MKTSEGMENT, COUNT(*) AS QTY\n    FROM SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.CUSTOMER\n    GROUP BY C_MKTSEGMENT;\n  `\n});\n\nconst results = await resultsPromise;\n\nif (!results) {\n  console.error("No results found");\n} else {\n  for (const result of results) {\n    // We can reference the results in a type-safe manner.\n    console.log(`Market Segment: ${result.C_MKTSEGMENT}, Quantity: ${result.QTY}`);\n  }\n}\n'})})]})}function d(e={}){const{wrapper:n}={...(0,i.R)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(u,{...e})}):u(e)}},8453:(e,n,s)=>{s.d(n,{R:()=>o,x:()=>l});var t=s(6540);const r={},i=t.createContext(r);function o(e){const n=t.useContext(i);return t.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:o(e.components),t.createElement(i.Provider,{value:n},e.children)}}}]);