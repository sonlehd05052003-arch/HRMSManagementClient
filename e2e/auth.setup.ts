import { expect, test as setup } from "@playwright/test";
import { PASSWORD, stateFor, USERS, type Role } from "./helpers";

// Signs each role in once and saves its session for the other tests (see stateFor)
for (const role of Object.keys(USERS) as Role[]) {
    setup(`đăng nhập ${role}`, async ({ request }) => {
        const response = await request.post("/api/Auth/login", { data: { username: USERS[role], password: PASSWORD } });
        expect(response.ok(), `login ${USERS[role]}: ${response.status()} ${await response.text()}`).toBeTruthy();
        await request.storageState({ path: stateFor(role) });
    });
}
