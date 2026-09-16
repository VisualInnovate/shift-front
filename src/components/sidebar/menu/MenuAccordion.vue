<template>
  <va-accordion v-model="accordionValue" class="sidebar-accordion va-sidebar__menu__inner" multiple>
    <va-collapse v-for="(route, idx) in visibleRoutes" :key="idx">
      <template #header>
        <va-sidebar-item :active="isRouteActive(route)" :to="route.children ? undefined : { name: route.name }">
          <va-sidebar-item-content>
            <va-icon :name="route.meta.icon" class="va-sidebar-item__icon" />

            <va-sidebar-item-title>
              {{ t(route.displayName) }}
            </va-sidebar-item-title>

            <va-icon v-if="route.children" :name="accordionValue[idx] ? 'expand_less' : 'expand_more'" />
          </va-sidebar-item-content>
        </va-sidebar-item>
      </template>
      <template v-for="(child, index) in route.children" :key="index">
        <va-sidebar-item v-if="isRouteVisible(child)" :active="isRouteActive(child)" :to="{ name: child.name }">
          <va-sidebar-item-content>
            <div class="va-sidebar-item__icon" />

            <va-sidebar-item-title>
              {{ t(child.displayName) }}
            </va-sidebar-item-title>
          </va-sidebar-item-content>
        </va-sidebar-item>
      </template>
    </va-collapse>
  </va-accordion>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { INavigationRoute } from '../NavigationRoutes'
  import { useRoute } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  const { t } = useI18n()
  const arr = ref<INavigationRoute[]>([])
  const showRoutes = ref<string[]>([])
  const props = withDefaults(
    defineProps<{
      items?: INavigationRoute[]
    }>(),
    {
      items: () => [],
    },
  )

  const accordionValue = ref<boolean[]>([])
  const visibleRoutes = computed(() => arr.value.filter((route) => isRouteVisible(route)))

  onMounted(() => {
    const storedPermissions = localStorage.getItem('userPermissions')
    try {
      const parsedPermissions = storedPermissions ? JSON.parse(storedPermissions) : []
      showRoutes.value = Array.isArray(parsedPermissions)
        ? parsedPermissions
            .map((permission: unknown) => {
              if (typeof permission === 'string') {
                return permission
              }

              if (permission && typeof permission === 'object') {
                const permissionRecord = permission as Record<string, unknown>
                const permissionField = ['name', 'permission', 'slug', 'key'].find(
                  (field) => typeof permissionRecord[field] === 'string',
                )
                return permissionField ? (permissionRecord[permissionField] as string) : undefined
              }

              return undefined
            })
            .filter((permission): permission is string => Boolean(permission))
        : []
    } catch {
      showRoutes.value = []
    }
    arr.value = props.items
  })
  // function isGroup(item: INavigationRoute) {
  //   return !!item.children
  // }

  function isRouteActive(item: INavigationRoute) {
    return item.name === useRoute().name
  }

  function hasPermission(route: INavigationRoute): boolean {
    const permissions = Array.isArray(route.show) ? route.show : [route.show]
    const hasRoutePermissions = route.requireAll
      ? permissions.every((permission) => permission && showRoutes.value.includes(permission))
      : permissions.some((permission) => permission && showRoutes.value.includes(permission))

    if (route.requireAll && route.show) {
      return hasRoutePermissions
    }

    if (route.children) {
      return route.children.some((child) => hasPermission(child))
    }

    return hasRoutePermissions
  }

  function isRouteVisible(route: INavigationRoute): boolean {
    return hasPermission(route)
  }

  function isItemExpanded(item: INavigationRoute): boolean {
    if (!item.children) {
      return false
    }

    const isCurrentItemActive = isRouteActive(item)
    const isChildActive = !!item.children.find((child) =>
      child.children ? isItemExpanded(child) : isRouteActive(child),
    )

    return isCurrentItemActive || isChildActive
  }
</script>
<style></style>
