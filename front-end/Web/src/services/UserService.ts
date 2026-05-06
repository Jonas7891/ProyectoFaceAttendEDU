//
//
// Lógica verdadera
//
//

import { users } from "./constants/users";

export const getUserByEmail = (email) => {
    switch (email) {
        case "admin@example.com":
            return users.find((user) => user.identification === 1);

        case "teacher@example.com":
            return users.find((user) => user.identification === 2);

        case "student@example.com":
            return users.find((user) => user.identification === 3);
    }
}