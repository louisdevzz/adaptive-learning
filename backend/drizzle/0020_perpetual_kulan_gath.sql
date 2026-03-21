CREATE TABLE "notification_digests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"digest_type" varchar(20) NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"notification_ids" json DEFAULT '[]'::json NOT NULL,
	"ai_summary" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"delivered_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"enabled_types" json DEFAULT '{"progress_alert":true,"assignment_assigned":true,"assignment_graded":true,"progress_update":true,"system":true}'::json NOT NULL,
	"digest_frequency" varchar(20) DEFAULT 'realtime' NOT NULL,
	"quiet_hours_start" varchar(5),
	"quiet_hours_end" varchar(5),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notification_preferences_user_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "notification_digests" ADD CONSTRAINT "notification_digests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notification_digests_user_type_idx" ON "notification_digests" USING btree ("user_id","digest_type");--> statement-breakpoint
CREATE INDEX "notification_digests_period_idx" ON "notification_digests" USING btree ("period_start","period_end");--> statement-breakpoint
CREATE INDEX "notification_digests_delivered_idx" ON "notification_digests" USING btree ("delivered_at");--> statement-breakpoint
CREATE INDEX "notification_preferences_digest_idx" ON "notification_preferences" USING btree ("digest_frequency");