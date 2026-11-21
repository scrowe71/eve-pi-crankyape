"use client";

import Error from "next/error";
/* eslint-disable react/prop-types */
export default function GlobalError({ error }) {
  console.error(error);

  return (
    <html>
      <body>
        <Error />
      </body>
    </html>
  );
}
