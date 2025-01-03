import { Request, Response } from "express";
import mongoose from "mongoose";

// Services
import {
  saveEmployeeDoc,
  findAllEmployeeDocs,
  findEmployeeById,
  buildHierarchy,
  updateEmployeeById,
} from "../services/employee.service";

export async function createEmployee(req: Request, res: Response) {
  try {
    if (
      req.body.designation.toUpperCase() !== "CEO" // ||
      // req.body.designation.toLowerCase() !== "chief executive officer"
    ) {
      if (!req.body.reporting) {
        return res.status(400).json({
          status: false,
          message: "Reporting person is required",
          error: "'reporting' key is missing",
        });
      }

      if (!mongoose.isValidObjectId(req.body.reporting)) {
        return res.status(400).json({
          status: false,
          message: "Invalid reporting id",
        });
      }
    }

    const employee = await saveEmployeeDoc(req.body);

    return res.status(201).json({
      status: true,
      message: "Employee added sucessfully",
      data: employee,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
}

export async function getAllEmployees(req: Request, res: Response) {
  try {
    let employees = await findAllEmployeeDocs();

    return res.status(200).json({
      status: true,
      message: "Employees get successfully.",
      data: employees,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server error. Please try again.",
      error,
    });
  }
}

export async function getEmployeeById(req: Request, res: Response) {
  try {
    const id = req.params.id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        status: false,
        message: "Invalid id in params",
      });
    }

    let employee = await findEmployeeById(id);

    if (employee) {
      res.status(200).json({
        status: true,
        message: "Employee get successfully.",
        data: employee,
      });
    } else {
      res.status(400).json({ status: true, message: "Employee not found." });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server error. Please try again.",
      error,
    });
  }
}

export async function getEmployeeTree(req: Request, res: Response) {
  try {
    let employees = await findAllEmployeeDocs();
    let tree = buildHierarchy(JSON.parse(JSON.stringify(employees)));

    return res.status(200).json({
      status: true,
      message: "Organization tree get successfully.",
      data: tree,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
}

export async function editEmployee(req: Request, res: Response) {
  try {
    const id = req.params.id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        status: false,
        message: "Invalid id in params",
      });
    }

    let updated = await updateEmployeeById(id, req.body);

    if (!updated) {
      res.status(400).json({ status: true, message: "Employee not found." });
    } else {
      res.status(200).json({
        status: true,
        message: "Employee get successfully.",
        data: updated,
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      status: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
}
