import axios from "axios";
import { config } from "dotenv";
config();

export const checkAuth = async () => {
	try {
		const res = await axios.get(
			`https://peer-programming-s.herokuapp.com/api/user`,
			{
				withCredentials: true,
			}
		);

		const user = res.data.user;
		const {
			name,
			email,
			googleID,
			picture,
			_id,
			sharedSessions,
			userSessions,
		} = user;

		const userPayload = {
			name,
			email,
			googleID,
			picture,
			_id,
			sharedSessions,
			userSessions,
		};

		return userPayload;
	} catch (e) {
		console.log(e);

		return null;
	}
};
