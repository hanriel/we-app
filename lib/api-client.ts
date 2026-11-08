import { client } from "@/lib/api-generated/client.gen";

// baseUrl на тот случай, если фронт и API когда-нибудь разъедутся по хостам;
// сейчас всё на одном origin, куки сессии идут с запросом автоматически
client.setConfig({ baseUrl: "/api" });
