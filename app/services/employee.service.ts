import _ from "lodash";
import employeeModel, { EmployeeDocument } from "../models/employee.model";

export async function saveEmployeeDoc(doc: EmployeeDocument) {
  try {
    return await employeeModel.create(doc);
  } catch (error: any) {
    throw new Error(error);
  }
}

export async function findAllEmployeeDocs() {
  try {
    return await employeeModel.find().lean();
  } catch (error: any) {
    throw new Error(error);
  }
}

export async function findEmployeeById(id: EmployeeDocument["_id"]) {
  try {
    return await employeeModel.findById(id);
  } catch (error: any) {
    throw new Error(error);
  }
}

export async function collateEmployeeTree() {
  try {
    return await employeeModel.aggregate([
      {
        $match: { designation: "CEO" },
      },
      {
        $graphLookup: {
          from: "employees",
          startWith: "$_id",
          connectFromField: "_id",
          connectToField: "reporting",
          as: "allChildren",
        },
      },
      {
        $addFields: {
          children: {
            $filter: {
              input: "$allChildren",
              as: "child",
              cond: { $eq: ["$$child.reporting", "$_id"] },
            },
          },
        },
      },
      {
        $project: {
          allChildren: 0, // Remove the flattened list
        },
      },
      {
        $set: {
          children: {
            $map: {
              input: "$children",
              as: "child",
              in: {
                $mergeObjects: [
                  "$$child",
                  {
                    children: {
                      $arrayElemAt: [
                        employeeModel.aggregate([
                          {
                            $match: {
                              reporting: "$$child._id",
                            },
                          },
                        ]),
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },
    ]);

    // .aggregate([
    //     {
    //       $addFields: {
    //         expanded: true,
    //         type: "person",
    //       },
    //     },
    //     {
    //       $lookup: {
    //         from: "employees",
    //         localField: "_id",
    //         foreignField: "reporting",
    //         as: "children",
    //       },
    //     },
    //     {
    //       $addFields: {
    //         children: {
    //           expanded: true,
    //           type: "person",
    //         },
    //       },
    //     },
    //     {
    //         $project: {
    //             __v: 0
    //         }
    //     },
    //     {
    //       $unwind: {
    //         path: "$children",
    //         // preserveNullAndEmptyArrays: true
    //       },
    //     },
    //     {
    //       $group: {
    //         _id: {
    //           _id: "$_id",
    //           fullName: "$fullName",
    //           designation: "$designation",
    //           date_of_birth: "$date_of_birth",
    //           experience_years: "$experience_years",
    //           picture: "$picture",
    //           createdAt: "$createdAt",
    //           updatedAt: "$updatedAt",
    //           __v: "$__v",
    //         },
    //         children: { $push: "$children" },
    //       },
    //     },
    //     {
    //       $addFields: {
    //         expanded: true,
    //         type: "person",
    //       },
    //     },
    //   ]);
  } catch (error: any) {
    throw new Error(error);
  }
}

type Employee = {
  _id: string;
  fullName: string;
  designation: string;
  date_of_birth: string;
  experience_years: number;
  picture: string;
  reporting?: string;
  expanded?: boolean;
  type?: string;
  children?: Employee[];
};

export function buildHierarchy(
  employees: Employee[],
  parentId: string | undefined = undefined
): Employee[] {
  return employees
    .filter((employee) => employee.reporting == parentId)
    .map((employee) => ({
      ...employee,
      expanded: true,
      type: "person",
      children: buildHierarchy(employees, employee._id), // Recursively build children
    }));
}

export async function updateEmployeeById(
  id: EmployeeDocument["_id"],
  doc: EmployeeDocument
) {
  try {
    return await employeeModel.findByIdAndUpdate(
      id,
      { $set: doc },
      { new: true }
    );
  } catch (error: any) {
    throw new Error(error);
  }
}
