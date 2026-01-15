-- Migration script to add team_management field to projects table
-- Run this in your Supabase SQL Editor

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS team_management JSONB DEFAULT '{
  "teamRoles": [],
  "goals": [],
  "communicationPlan": {
    "tools": [],
    "protocols": "",
    "escalationPaths": ""
  },
  "resourceAllocation": {
    "capacityPlanning": "",
    "schedules": "",
    "budget": ""
  },
  "performanceMonitoring": {
    "metrics": [],
    "reviewFrequency": "",
    "tools": []
  },
  "motivationDevelopment": {
    "incentives": [],
    "trainingPlans": [],
    "recognitionPrograms": []
  },
  "conflictResolution": {
    "policies": "",
    "mediationProcess": "",
    "documentation": ""
  },
  "riskManagement": {
    "riskRegister": [],
    "mitigationStrategies": [],
    "contingencyPlans": ""
  }
}'::jsonb;

COMMENT ON COLUMN projects.team_management IS 'Comprehensive team management data including roles, goals, communication, resources, performance, motivation, conflict resolution, and risk management';
