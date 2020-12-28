import { PrefixLogger } from "@toes/logger";

export const logger = new PrefixLogger({
  color: true,
  prefix: "Vulcyn",
  separator: " > ",
});
