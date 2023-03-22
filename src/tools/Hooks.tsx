import { useState, useEffect } from "react";

export const useStateContext = (parent: any, key: any) => {
  const [val, setVal] = useState(parent[key]);

  useEffect(() => {
    parent[key] = val;
  }, [val]);

  return [val, setVal];
}

