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
    return await employeeModel.aggregate([{
      $project: {
        __v: 0
      }
    }]);
  } catch (error: any) {
    throw new Error(error);
  }
}

export async function findAllEmployeeTreeDocs() {
  try {
    const result = await employeeModel.aggregate([
      {
        $match: {
          designation: "CEO"
        }
      },
      {
        $lookup: {
          from: "employees", // The collection name in MongoDB
          localField: "_id",
          foreignField: "reporting",
          as: "children"
        }
      },
      {
        $lookup: {
          from: "employees", // The collection name in MongoDB
          localField: "children._id", // Reference each child's _id to find grandchildren
          foreignField: "reporting",
          as: "grandchildren"
        }
      },
      {
        $lookup: {
          from: "employees", // The collection name in MongoDB
          localField: "grandchildren._id", // Reference each grandchild's _id to find supergrandchildren
          foreignField: "reporting",
          as: "supergrandchildren"
        }
      },
      {
        $lookup: {
          from: "employees", // The collection name in MongoDB
          localField: "supergrandchildren._id", // Reference each supergrandchild's _id to find superjiograndchildren
          foreignField: "reporting",
          as: "superjiograndchildren"
        }
      },
      {
        $project: {
          _id: 1,
          fullName: 1,
          designation: 1,
          picture: 1,
          children: {
            $map: {
              input: "$children",
              as: "child",
              in: {
                expanded: true,
                type: "person",
                data: {
                  image: "$$child.picture",
                  name: "$$child.fullName",
                  title: "$$child.designation"
                },
                children: {
                  $let: {
                    vars: {
                      childId: "$$child._id"
                    },
                    in: {
                      $ifNull: [
                        {
                          $map: {
                            input: {
                              $filter: {
                                input: "$grandchildren",
                                as: "grandchild",
                                cond: { $eq: ["$$grandchild.reporting", "$$childId"] }
                              }
                            },
                            as: "grandchild",
                            in: {
                              expanded: true,
                              type: "person",
                              data: {
                                image: "$$grandchild.picture",
                                name: "$$grandchild.fullName",
                                title: "$$grandchild.designation"
                              },
                              children: {
                                $let: {
                                  vars: {
                                    grandchildId: "$$grandchild._id"
                                  },
                                  in: {
                                    $ifNull: [
                                      {
                                        $map: {
                                          input: {
                                            $filter: {
                                              input: "$supergrandchildren",
                                              as: "supergrandchild",
                                              cond: { $eq: ["$$supergrandchild.reporting", "$$grandchildId"] }
                                            }
                                          },
                                          as: "supergrandchild",
                                          in: {
                                            expanded: true,
                                            type: "person",
                                            data: {
                                              image: "$$supergrandchild.picture",
                                              name: "$$supergrandchild.fullName",
                                              title: "$$supergrandchild.designation"
                                            },
                                            children: {
                                              $let: {
                                                vars: {
                                                  supergrandchildId: "$$supergrandchild._id"
                                                },
                                                in: {
                                                  $ifNull: [
                                                    {
                                                      $map: {
                                                        input: {
                                                          $filter: {
                                                            input: "$superjiograndchildren",
                                                            as: "superjiograndchild",
                                                            cond: { $eq: ["$$superjiograndchild.reporting", "$$supergrandchildId"] }
                                                          }
                                                        },
                                                        as: "superjiograndchild",
                                                        in: {
                                                          expanded: true,
                                                          type: "person",
                                                          data: {
                                                            image: "$$superjiograndchild.picture",
                                                            name: "$$superjiograndchild.fullName",
                                                            title: "$$superjiograndchild.designation"
                                                          }
                                                        }
                                                      }
                                                    },
                                                    [] // Default to an empty array if no superjiograndchildren
                                                  ]
                                                }
                                              }
                                            }
                                          }
                                        }
                                      },
                                      [] // Default to an empty array if no supergrandchildren
                                    ]
                                  }
                                }
                              }
                            }
                          }
                        },
                        [] // Default to an empty array if no grandchildren
                      ]
                    }
                  }
                }
              }
            }
          }
        }
      },
      {
        $addFields: {
          expanded: true,
          type: "person",
          data: {
            image: "$picture",
            name: "$fullName",
            title: "$designation"
          }
        }
      },
      {
        $project: {
          _id: 0, // Exclude _id if needed
          expanded: 1,
          type: 1,
          data: 1,
          children: 1
        }
      }
    ]);

    return result;
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