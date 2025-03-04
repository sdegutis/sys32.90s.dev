declare namespace JSX {

  type IntrinsicElements =
    & { [K in keyof HTMLElementTagNameMap]: Partial<HTMLElementTagNameMap[K]> }
    & { [K in keyof SVGElementTagNameMap]: Record<string, string> };

}
