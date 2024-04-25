import express from 'express';
import securityCompliance from '../models/securityComplience.js';
import controlsversion from '../models/copy_of_cis_controls_version_8_1.js';

import Organization, { OrganizationSecurityControl } from '../models/organizations.js';
import Assessment from '../models/Assesment.js';
import assessment_task from '../models/Assessment_tasks.js';
import generatePDF from '../utils/generatePDF.js';
import generatePPT from '../utils/generatePPT.js';
import { getImage } from '../utils/generateImage.js';
import roles from '../models/role.js';
import Book2 from '../models/othercontrols.js';

export const complianceController = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await securityCompliance.findOne({
      // attributes: [
      where: {
        complianceid: id
      },
      include: {
        model: controlsversion,
        attributes: [
          // 'id',
          'cis_safeguard',
          'title',
          'description',
          'securitycomplianceid',
          'controlversion',
          'assetype',
          'securityfunction',
        ],
      }
    });
    res.send(result)
  } catch (error) {
    console.log("erroe", error);
  }
}

export const AllcomplianceController = async (req, res) => {
  try {
    // const { id } = req.params;

    const result = await securityCompliance.findAll({
      // attributes: [
      // where: {
      //   complianceid: id
      // },
      include: {
        model: controlsversion,
        attributes: [
          // 'id',
          'cis_safeguard',
          'title',
          'description',
          'securitycomplianceid',
          'controlversion',
          'assetype',
          'securityfunction',
        ],
      }
    });
    res.send(result)
  } catch (error) {
    console.log("erroe", error);
  }
}

export const getMainCompliance = async (req, res) => {
  try {
    const { version } = req.params;
    const result = await securityCompliance.findAll({
      where: {
        version
      },
      attributes: [
        'complianceid',
        'title'
      ]
    })
    res.status(201).send(result)
  } catch (error) {
    console.log(error);
  }
}
export const getSubControls = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await controlsversion.findOne({
      where: {
        cis_safeguard: id
      },
      include: {
        model: assessment_task
      }
    })
    res.send(result);
    console.log(result);
  } catch (error) {
    console.log(error);
  }
}
export const orgCompliance = async (req, res) => {
  try {
    console.log(req.body);
    const conformation = await OrganizationSecurityControl.create({
      OrganizationId: req.body.orgid,
      controlsversionId: req.body.controlsversionId
    });
    console.log(conformation);
    res.send({
      conformation
    })
  } catch (error) {
    res.send({
      success: false,
      message: "sorry"
    })
    console.log(error);
  }
};

export const getOrgCompliances = async (req, res) => {
  const { name } = req.body;
  try {
    const result = await Organization.findOne({
      where: {
        orgName: name
      },
      include: {
        model: controlsversion
      }
    });
    console.log(result);
    res.send({
      result
    })
  } catch (error) {
    console.log(error);
  }
}

export const createassessment = async (req, res) => {
  const { ogrName, assessmentName, description, framework, status, scoring_method, overall_score } = req.body;
  try {
    console.log(ogrName, assessmentName, description, framework, status, scoring_method, overall_score);
    const result = await Assessment.create({
      organization_id: ogrName,
      framework,
      name: assessmentName,
      description,
      status,
      scoring_method,
      overall_score
    });
    console.log(result);
  } catch (error) {

  }
}

export const orggetassessment = async (req, res) => {
  const { id } = req.params;

  try {
    const assessment = await Assessment.findOne({
      where: { organization_id: id },
      include: {
        model: Organization
      }
    })
    // console.log(assessment);
    res.send({ assessment });
  } catch (error) {
    console.log(error);
  }
}

export const orgaddtask = async (req, res) => {
  const { assessmentid, controlautomatedid, controlimplementedid, controlreportedid, status, duedate, assignedby, assignedto, validatedby, completedby, note, proofofworkid, policydefinedid } = req.body
  try {
    const conformation = await assessment_task.create({
      assessmentid,
      controlautomatedid,
      controlimplementedid,
      controlreportedid,
      status,
      duedate: new Date() + 5,
      assignedby,
      assignedto,
      validatedby,
      completedby,
      note,
      proofofworkid,
      policydefinedid
    })
    // console.log(assessmentid,controlautomatedid,controlimplementedid,controlreportedid,status,duedate,assignedby,assignedto,validatedby,completedby,note,proofofworkid,policydefinedid);
  } catch (error) {
    console.log(error);
  }
}

export const getassessmenttask = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Organization.findOne({
      where: { id },
      include: {
        model: Assessment
      }
    })
    res.send({ result });
  } catch (error) {
    console.log(error);
  }
}

export const generatepdf = async (req, res) => {
  try {
    const pdf = generatePDF();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=report.pdf");
    console.log("sent");
    res.send(pdf);

  } catch (error) {
    console.log(error);
  }
}

export const generateppt = async (req, res) => {
  try {
    const pptx = await generatePPT();

    const pptxBuffer = await pptx.stream();
    const fileName = 'sample.pptx';

    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    //res.send(pptxBuffer);
    console.log(pptxBuffer);
    res.send(pptxBuffer)
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, error });
  }
};

export const generateSpiderWeb = async (req, res) => {
  try {
    const image = await getImage();

    // console.log("image1",image);
    res.send({ image })
  } catch (error) {
    console.log(error);
  }
}
