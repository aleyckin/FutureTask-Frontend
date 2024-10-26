export class UsersOnProject{
    constructor(data) {
        this.id = data?.userId;
        this.email = data?.userEmail;
        this.roleOnProject = data?.roleOnProject;
    }
}