import React from "react";
import "./Uploader.scss";

export const Uploader = React.forwardRef(
  (
    props: React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >,
    ref: React.ForwardedRef<HTMLInputElement>
  ) => (
    <input
      aria-label="uploader"
      className="uploader"
      type="file"
      title=""
      ref={ref}
      {...props}
    />
  )
);
