export class User {
    constructor(data) {
      this.id = data?.id;
      this.title = data?.title;
      this.description = data?.description;
      this.DateCreated = data?.DateCreated;
      this.DateEnd = data?.DateEnd;
      this.User = data?.User;
      this.Column = data?.Column;
    }
  }
  