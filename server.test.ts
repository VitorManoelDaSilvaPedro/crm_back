import axios from "axios";
import server from "./server";


describe("Testando o servidor", () => {

    beforeAll((done) => {
        server.on("listening", () => {
            done();
        })
    });

    afterAll((done) => {
        server.close(() => {
            done();
        });
    })

    it("O servidor tem que estar rodando na porta 4000", async () => {
        const response = await axios.get("http://localhost:4000/");
        expect(response.status).toBe(200);
    });
})