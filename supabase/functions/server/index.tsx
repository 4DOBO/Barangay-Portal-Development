import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-97d3df46/health", (c) => {
  return c.json({ status: "ok" });
});

// Create a report (public endpoint for residents)
app.post("/make-server-97d3df46/reports", async (c) => {
  try {
    const body = await c.req.json();
    const { title, description, category, location, contactName, contactPhone } = body;

    if (!title || !description || !category) {
      return c.json({ error: "Missing required fields: title, description, category" }, 400);
    }

    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const report = {
      id: reportId,
      title,
      description,
      category,
      location: location || "",
      contactName: contactName || "",
      contactPhone: contactPhone || "",
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(reportId, report);
    console.log(`Report created successfully: ${reportId}`);
    return c.json({ success: true, report }, 201);
  } catch (error) {
    console.log(`Error creating report: ${error}`);
    return c.json({ error: `Failed to create report: ${error.message}` }, 500);
  }
});

// Get all reports with optional status filter
app.get("/make-server-97d3df46/reports", async (c) => {
  try {
    const status = c.req.query("status");
    const reports = await kv.getByPrefix("report_");

    let filteredReports = reports;
    if (status && status !== "primary") {
      filteredReports = reports.filter((r) => r.status === status);
    }

    // Sort by creation date (newest first)
    filteredReports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    console.log(`Retrieved ${filteredReports.length} reports with status filter: ${status || "all"}`);
    return c.json({ success: true, reports: filteredReports });
  } catch (error) {
    console.log(`Error retrieving reports: ${error}`);
    return c.json({ error: `Failed to retrieve reports: ${error.message}` }, 500);
  }
});

// Update report status (admin only)
app.patch("/make-server-97d3df46/reports/:id", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      console.log(`Unauthorized report update attempt: ${authError?.message || "No user found"}`);
      return c.json({ error: "Unauthorized" }, 401);
    }

    const reportId = c.req.param("id");
    const body = await c.req.json();
    const { status } = body;

    if (!["pending", "in_progress", "done"].includes(status)) {
      return c.json({ error: "Invalid status. Must be: pending, in_progress, or done" }, 400);
    }

    const report = await kv.get(reportId);
    if (!report) {
      return c.json({ error: "Report not found" }, 404);
    }

    const updatedReport = {
      ...report,
      status,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(reportId, updatedReport);
    console.log(`Report ${reportId} status updated to: ${status}`);
    return c.json({ success: true, report: updatedReport });
  } catch (error) {
    console.log(`Error updating report status: ${error}`);
    return c.json({ error: `Failed to update report: ${error.message}` }, 500);
  }
});

// Delete report (admin only)
app.delete("/make-server-97d3df46/reports/:id", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      console.log(`Unauthorized report delete attempt: ${authError?.message || "No user found"}`);
      return c.json({ error: "Unauthorized" }, 401);
    }

    const reportId = c.req.param("id");
    const report = await kv.get(reportId);
    if (!report) {
      return c.json({ error: "Report not found" }, 404);
    }

    await kv.del(reportId);
    console.log(`Report deleted successfully: ${reportId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting report: ${error}`);
    return c.json({ error: `Failed to delete report: ${error.message}` }, 500);
  }
});

// Create announcement (admin only)
app.post("/make-server-97d3df46/announcements", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      console.log(`Unauthorized announcement creation attempt: ${authError?.message || "No user found"}`);
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { title, content, imageUrl } = body;

    if (!title || !content) {
      return c.json({ error: "Missing required fields: title, content" }, 400);
    }

    const announcementId = `announcement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const announcement = {
      id: announcementId,
      title,
      content,
      imageUrl: imageUrl || "",
      createdAt: new Date().toISOString(),
    };

    await kv.set(announcementId, announcement);
    console.log(`Announcement created successfully: ${announcementId}`);
    return c.json({ success: true, announcement }, 201);
  } catch (error) {
    console.log(`Error creating announcement: ${error}`);
    return c.json({ error: `Failed to create announcement: ${error.message}` }, 500);
  }
});

// Get all announcements
app.get("/make-server-97d3df46/announcements", async (c) => {
  try {
    const announcements = await kv.getByPrefix("announcement_");
    announcements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    console.log(`Retrieved ${announcements.length} announcements`);
    return c.json({ success: true, announcements });
  } catch (error) {
    console.log(`Error retrieving announcements: ${error}`);
    return c.json({ error: `Failed to retrieve announcements: ${error.message}` }, 500);
  }
});

// Create project (admin only)
app.post("/make-server-97d3df46/projects", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      console.log(`Unauthorized project creation attempt: ${authError?.message || "No user found"}`);
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { title, description, imageUrl, status } = body;

    if (!title || !description) {
      return c.json({ error: "Missing required fields: title, description" }, 400);
    }

    const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const project = {
      id: projectId,
      title,
      description,
      imageUrl: imageUrl || "",
      status: status || "ongoing",
      createdAt: new Date().toISOString(),
    };

    await kv.set(projectId, project);
    console.log(`Project created successfully: ${projectId}`);
    return c.json({ success: true, project }, 201);
  } catch (error) {
    console.log(`Error creating project: ${error}`);
    return c.json({ error: `Failed to create project: ${error.message}` }, 500);
  }
});

// Get all projects
app.get("/make-server-97d3df46/projects", async (c) => {
  try {
    const projects = await kv.getByPrefix("project_");
    projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    console.log(`Retrieved ${projects.length} projects`);
    return c.json({ success: true, projects });
  } catch (error) {
    console.log(`Error retrieving projects: ${error}`);
    return c.json({ error: `Failed to retrieve projects: ${error.message}` }, 500);
  }
});

// Admin signup
app.post("/make-server-97d3df46/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return c.json({ error: "Missing required fields: email, password" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || "" },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.log(`Error during admin signup: ${error.message}`);
      return c.json({ error: `Signup failed: ${error.message}` }, 400);
    }

    console.log(`Admin user created successfully: ${email}`);
    return c.json({ success: true, user: data.user }, 201);
  } catch (error) {
    console.log(`Error creating admin user: ${error}`);
    return c.json({ error: `Failed to create admin user: ${error.message}` }, 500);
  }
});

Deno.serve(app.fetch);
