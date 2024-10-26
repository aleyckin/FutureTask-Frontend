export class Task {
    constructor(data) {
      this.id = data?.id;
      this.title = data?.title;
      this.description = data?.description;
      this.dateCreated = data?.dateCreated;
      this.dateEnd = data?.dateEnd;
      this.userId = data?.userId;
      this.column = data?.column;
    }
  }
  