import bcrypt from "bcrypt";

class User {
    constructor(id = null, email, first_name, last_name, password, profile_image = null) {
        this.id = id;
        this.email = email;
        this.first_name = first_name;
        this.last_name = last_name;
        this.password = password;
        this.profile_image = profile_image || 'https://fastly.picsum.photos/id/847/200/200.jpg?hmac=ET2eUKsG4SCaCnGMrTpgEBXpx7YG1j2X8DpBnHC25wA';
    }

    toResponse() {
        return {
            email: this.email,
            first_name: this.first_name,
            last_name: this.last_name,
            profile_image: this.getImageUrl(),
        }
    }

    getImageUrl() {
        const base_url = process.env.BASE_URL || 'http://localhost:3000';
        return `${base_url}/${this.profile_image}`;
    }

}

const save = async (trx, user) => {    
    try{
        const salt = parseInt(process.env.SALT_ROUNDS) || 10;
        const hashPassword = await bcrypt.hash(user.password, salt);

        const query = `
            insert into users (email, first_name, last_name, password, profile_image) values
            ($1, $2, $3, $4, $5)
        `;

        const result = await trx.query(query, [user.email, user.first_name, user.last_name, hashPassword, user.profile_image]);

        if(result) {
            await trx.query("COMMIT");
            return result;
        }
    }
    catch(err) {
        await trx.query("ROLLBACK");
        console.log("Error: ", err);
        return null;
    }
}

const findByEmail = async (trx, email) => {
    const query = `
        select * from users where email = $1
    `;

    const result = await trx.query(query, [email]);

    if(result.rows.length === 0) { 
        return null;
    }

    const row = result.rows[0];
    return new User(row.id, row.email, row.first_name, row.last_name, row.password, row.profile_image);
}

const update = async (trx, user) => {
    const query = `
        update users set first_name = $1, last_name = $2, profile_image = $3 where email = $4
    `;

    const result = await trx.query(query, [user.first_name, user.last_name, user.profile_image, user.email]);
    return result;
}

export default { User, save, findByEmail, update };