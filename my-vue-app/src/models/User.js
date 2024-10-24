export class User{
    constructor(data) {
        this.id = data?.id;
        this.email = data?.email;
        this.password = data?.password;
        this.specializationName = data?.specializationName;
        this.userRole = data?.userRole;
    }
}