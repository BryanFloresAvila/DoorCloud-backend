import mqtt from 'mqtt'
import { FastifyBaseLogger } from 'fastify'

declare global {
  // eslint-disable-next-line no-var
  var __mqttClient__: mqtt.MqttClient
}

const options: mqtt.IClientOptions = {
  port: process.env.MQTT_PORT ? parseInt(process.env.MQTT_PORT) : 0,
  host: process.env.MQTT_HOST,
  protocol: 'mqtts',
  keepalive: 0,
  username: process.env.MQTT_USER,
  password: process.env.MQTT_PASS
}
const namespace = 'DoorCloud:Mqtt:Server'
const debugMessage = 'Connected to mqtt server'

const getClient = (logger?: FastifyBaseLogger) => {
  if (!global.__mqttClient__) {
    global.__mqttClient__ = mqtt.connect(options)
    global.__mqttClient__.on('connect', () => {
      if (logger) logger?.info({}, debugMessage)
      else
        import('debug').then(debug => {
          const clientDebug = debug.default(namespace)

          clientDebug(debugMessage)
        })
    })
  }

  return global.__mqttClient__
}

const mqttConnection = (logger: FastifyBaseLogger) => ({
  start: async () => {
    const { applyRoutes } = await import('./router')

    applyRoutes(getClient(logger), logger)

    return global.__mqttClient__
  },
  stop: async () => {
    getClient(logger).end()
  }
})

export { getClient, mqttConnection, namespace, debugMessage }
