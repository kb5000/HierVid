import React from "react";

export class Else extends React.Component<{ children: React.ReactNode }> {
  render(): React.ReactNode {
    return <>{this.props.children}</>
  }
}

export const If = (props: { "v-if": boolean; children: React.ReactNode }) => {
  return (
    <>
      {React.Children.map(props.children, (child: any) => {
        const isElse = child?.type === Else
        return isElse === props["v-if"] ? <></> : child;
      })}
    </>
  );
};

export const For = (props: {
  "v-for": any[];
  children: (value: any, index?: number, array?: any[]) => any;
}) => <>{props["v-for"].map(props.children)}</>;
