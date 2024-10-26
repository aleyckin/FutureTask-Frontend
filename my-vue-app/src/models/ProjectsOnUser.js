export class ProjectsOnUser{
    constructor(data) {
        this.id = data?.projectId;
        this.name = data?.projectName;
        this.roleOnProject = data?.roleOnProject;
    }
}