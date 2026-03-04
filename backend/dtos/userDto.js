class UserDTO {
    constructor(userFromDb) {
        this.id = userFromDb.id;
        this.email = userFromDb.email;
        this.name = userFromDb.name;
    }
}

module.exports = UserDTO;