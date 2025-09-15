const express = require("express");
const router = express.Router();
const { checkAuth, checkRole } = require("../middlewares/authentication");
const { validateId } = require("../middlewares/validation");
const Order = require("../models/order");
const {
  getStatusInfo,
  getAllStatusInfo,
  isValidStatus,
  getNextPossibleStatuses,
  createTrackingStep,
} = require("../utils/orderStatusUtils");

/**
 * GET /api/orders/statuses
 * Obtiene todos los estados disponibles con sus descripciones
 */
router.get("/statuses", async (req, res) => {
  try {
    const statusInfo = getAllStatusInfo();
    res.status(200).json({
      success: true,
      data: statusInfo,
    });
  } catch (error) {
    console.error("Error al obtener estados:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
});

/**
 * GET /api/orders/:id/tracking
 * Obtiene el tracking completo de una orden
 */
router.get("/:id/tracking", validateId, async (req, res) => {
  try {
    const order = await Order.findOne({
      id: req.params.id,
      nullDate: null,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Orden no encontrada",
      });
    }

    // Verificar si el usuario puede ver esta orden
    if (
      !req.user ||
      (req.user.id !== order.customer.userId?.toString() &&
        !["admin", "owner"].includes(req.user.role))
    ) {
      return res.status(403).json({
        success: false,
        error: "No tienes permisos para ver esta orden",
      });
    }

    const currentStatusInfo = getStatusInfo(order.status);
    const trackingSteps = order.trackingSteps.map((step) => ({
      ...step.toObject(),
      statusInfo: getStatusInfo(step.status),
    }));

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        currentStatus: order.status,
        currentStatusInfo,
        trackingSteps,
        importInfo: order.importInfo,
        issues: order.issues,
        notifications: order.notifications,
        documents: order.documents,
        estimatedDelivery: order.importInfo?.estimatedArrivalDate,
        actualDelivery: order.importInfo?.actualArrivalDate,
      },
    });
  } catch (error) {
    console.error("Error al obtener tracking:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
});

/**
 * PUT /api/orders/:id/status
 * Actualiza el estado de una orden (solo admin)
 */
router.put(
  "/:id/status",
  checkAuth,
  checkRole(["admin", "owner"]),
  validateId,
  async (req, res) => {
    try {
      const { status, description, location, additionalInfo } = req.body;

      if (!isValidStatus(status)) {
        return res.status(400).json({
          success: false,
          error: "Estado inválido",
        });
      }

      const order = await Order.findOne({
        id: req.params.id,
        nullDate: null,
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          error: "Orden no encontrada",
        });
      }

      // Verificar si el cambio de estado es válido
      const nextPossibleStatuses = getNextPossibleStatuses(order.status);
      if (!nextPossibleStatuses.includes(status) && status !== order.status) {
        return res.status(400).json({
          success: false,
          error: `No se puede cambiar de ${order.status} a ${status}`,
          possibleStatuses: nextPossibleStatuses,
        });
      }

      // Marcar el step actual como completado
      order.trackingSteps.forEach((step) => {
        if (step.current) {
          step.completed = true;
          step.current = false;
        }
      });

      // Crear nuevo tracking step
      const newTrackingStep = createTrackingStep(status, {
        description,
        location,
        current: true,
        updatedBy: "admin",
        additionalInfo,
      });

      order.trackingSteps.push(newTrackingStep);
      order.status = status;

      await order.save();

      // TODO: Enviar notificación al cliente

      res.status(200).json({
        success: true,
        message: "Estado actualizado correctamente",
        data: {
          orderId: order.id,
          newStatus: status,
          statusInfo: getStatusInfo(status),
        },
      });
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      res.status(500).json({
        success: false,
        error: "Error interno del servidor",
      });
    }
  }
);

/**
 * POST /api/orders/:id/issues
 * Reporta un problema con la orden
 */
router.post(
  "/:id/issues",
  checkAuth,
  checkRole(["admin", "owner"]),
  validateId,
  async (req, res) => {
    try {
      const { type, description } = req.body;

      const order = await Order.findOne({
        id: req.params.id,
        nullDate: null,
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          error: "Orden no encontrada",
        });
      }

      const newIssue = {
        type,
        description,
        date: new Date(),
        resolved: false,
      };

      order.issues.push(newIssue);
      await order.save();

      res.status(200).json({
        success: true,
        message: "Problema reportado correctamente",
        data: newIssue,
      });
    } catch (error) {
      console.error("Error al reportar problema:", error);
      res.status(500).json({
        success: false,
        error: "Error interno del servidor",
      });
    }
  }
);

/**
 * PUT /api/orders/:id/issues/:issueId/resolve
 * Marca un problema como resuelto
 */
router.put(
  "/:id/issues/:issueId/resolve",
  checkAuth,
  checkRole(["admin", "owner"]),
  validateId,
  async (req, res) => {
    try {
      const { resolutionDescription } = req.body;

      const order = await Order.findOne({
        id: req.params.id,
        nullDate: null,
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          error: "Orden no encontrada",
        });
      }

      const issue = order.issues.id(req.params.issueId);
      if (!issue) {
        return res.status(404).json({
          success: false,
          error: "Problema no encontrado",
        });
      }

      issue.resolved = true;
      issue.resolutionDate = new Date();
      issue.resolutionDescription = resolutionDescription;

      await order.save();

      res.status(200).json({
        success: true,
        message: "Problema marcado como resuelto",
        data: issue,
      });
    } catch (error) {
      console.error("Error al resolver problema:", error);
      res.status(500).json({
        success: false,
        error: "Error interno del servidor",
      });
    }
  }
);

/**
 * PUT /api/orders/:id/import-info
 * Actualiza la información de importación
 */
router.put(
  "/:id/import-info",
  checkAuth,
  checkRole(["admin", "owner"]),
  validateId,
  async (req, res) => {
    try {
      const importInfoUpdate = req.body;

      const order = await Order.findOne({
        id: req.params.id,
        nullDate: null,
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          error: "Orden no encontrada",
        });
      }

      // Actualizar información de importación
      order.importInfo = {
        ...order.importInfo?.toObject(),
        ...importInfoUpdate,
      };

      await order.save();

      res.status(200).json({
        success: true,
        message: "Información de importación actualizada",
        data: order.importInfo,
      });
    } catch (error) {
      console.error("Error al actualizar información de importación:", error);
      res.status(500).json({
        success: false,
        error: "Error interno del servidor",
      });
    }
  }
);

module.exports = router;
