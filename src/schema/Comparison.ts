
export class ComparisonSettings {
  constructor(
    public slots: number = 2,
    public border: boolean = false,
    public bigImage: string = "",
    public layoutType: { name: string; image: string }[] = []
  ) {}
}
