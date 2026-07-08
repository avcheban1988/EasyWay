-- Импорт в БД a1162533_EasyWay
USE `a1162533_EasyWay`;
-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: localhost    Database: easyway_calories
-- ------------------------------------------------------
-- Server version	8.0.45-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `favorite_products`
--

DROP TABLE IF EXISTS `favorite_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorite_products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_fav` (`user_id`,`product_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `favorite_products_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `favorite_products_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorite_products`
--

LOCK TABLES `favorite_products` WRITE;
/*!40000 ALTER TABLE `favorite_products` DISABLE KEYS */;
/*!40000 ALTER TABLE `favorite_products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `food_entries`
--

DROP TABLE IF EXISTS `food_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `food_entries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `date` date NOT NULL,
  `meal_type` enum('Завтрак','Обед','Ужин','Перекус') COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `calories` int NOT NULL,
  `proteins` decimal(6,1) NOT NULL DEFAULT '0.0',
  `fats` decimal(6,1) NOT NULL DEFAULT '0.0',
  `carbs` decimal(6,1) NOT NULL DEFAULT '0.0',
  `grams` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `food_entries_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `food_entries_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `food_entries`
--

LOCK TABLES `food_entries` WRITE;
/*!40000 ALTER TABLE `food_entries` DISABLE KEYS */;
/*!40000 ALTER TABLE `food_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `meal_plans`
--

DROP TABLE IF EXISTS `meal_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `meal_plans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `date` date NOT NULL,
  `meal_type` enum('Завтрак','Обед','Ужин','Перекус') COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipe_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `grams` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `recipe_id` (`recipe_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `meal_plans_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `meal_plans_ibfk_2` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `meal_plans_ibfk_3` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meal_plans`
--

LOCK TABLES `meal_plans` WRITE;
/*!40000 ALTER TABLE `meal_plans` DISABLE KEYS */;
/*!40000 ALTER TABLE `meal_plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `calories_per_100` decimal(6,1) NOT NULL,
  `proteins_per_100` decimal(6,1) NOT NULL DEFAULT '0.0',
  `fats_per_100` decimal(6,1) NOT NULL DEFAULT '0.0',
  `carbs_per_100` decimal(6,1) NOT NULL DEFAULT '0.0',
  `package_grams` int DEFAULT NULL,
  `barcode` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT '1',
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=234 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Молоко 3.2%',60.0,3.0,3.2,4.8,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(2,'Молоко 2.5%',54.0,2.9,2.5,4.8,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(3,'Молоко 1%',42.0,3.0,1.0,4.8,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(4,'Кефир 3.2%',59.0,3.0,3.2,4.0,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(5,'Йогурт греческий',59.0,10.0,0.5,3.5,140,NULL,1,NULL,'2026-07-07 11:43:44'),(6,'Творог 5%',145.0,16.0,5.0,3.0,200,NULL,1,NULL,'2026-07-07 11:43:44'),(7,'Творог обезжиренный',90.0,18.0,0.5,3.3,200,NULL,1,NULL,'2026-07-07 11:43:44'),(8,'Сыр твердый',392.0,35.0,27.0,0.0,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(9,'Сыр Моцарелла',280.0,22.0,20.0,2.0,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(10,'Сметана 20%',206.0,2.5,20.0,3.5,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(11,'Масло сливочное',717.0,0.9,81.0,0.1,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(12,'Куриная грудка',165.0,31.0,3.6,0.0,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(13,'Куриное бедро',185.0,20.0,11.0,0.0,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(14,'Индейка филе',135.0,29.0,1.5,0.0,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(15,'Говядина вырезка',158.0,25.0,6.0,0.0,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(16,'Говяжий фарш',230.0,18.0,17.0,0.0,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(17,'Свинина вырезка',143.0,21.0,6.0,0.0,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(18,'Печень куриная',136.0,20.0,5.0,1.0,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(19,'Лосось слабосоленый',200.0,22.0,12.0,0.0,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(20,'Горбуша',140.0,22.0,6.0,0.0,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(21,'Тунец консервированный',115.0,25.0,1.0,0.0,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(22,'Треска',82.0,18.0,0.7,0.0,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(23,'Креветки',99.0,21.0,1.0,0.0,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(24,'Яйцо куриное',155.0,13.0,11.0,1.1,60,NULL,1,NULL,'2026-07-07 11:43:44'),(25,'Рис белый',130.0,2.7,0.3,28.0,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(26,'Гречка',343.0,13.0,3.4,72.0,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(27,'Овсянка (вареная)',68.0,2.5,1.5,12.0,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(28,'Макароны тв. сорта',350.0,12.0,1.5,72.0,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(29,'Киноа',120.0,4.0,2.0,21.0,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(30,'Хлеб цельнозерновой',247.0,13.0,3.4,41.0,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(31,'Хлеб белый',265.0,8.0,3.0,50.0,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(32,'Лаваш тонкий',275.0,9.0,2.0,55.0,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(33,'Огурец',15.0,0.7,0.1,3.6,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(34,'Помидор',18.0,0.9,0.2,3.9,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(35,'Перец болгарский',26.0,1.0,0.3,5.0,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(36,'Капуста белокочанная',25.0,1.3,0.2,5.8,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(37,'Брокколи',34.0,2.8,0.4,7.0,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(38,'Морковь',41.0,0.9,0.2,10.0,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(39,'Лук репчатый',40.0,1.1,0.1,9.0,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(40,'Картофель',77.0,2.0,0.1,17.0,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(41,'Авокадо',160.0,2.0,15.0,9.0,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(42,'Яблоко',52.0,0.3,0.2,14.0,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(43,'Банан',89.0,1.1,0.3,23.0,120,NULL,1,NULL,'2026-07-07 11:43:44'),(44,'Апельсин',43.0,0.9,0.1,9.0,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(45,'Клубника',32.0,0.7,0.3,8.0,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(46,'Виноград',69.0,0.7,0.2,18.0,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(47,'Арбуз',30.0,0.6,0.2,8.0,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(48,'Миндаль',579.0,21.0,49.0,21.0,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(49,'Грецкий орех',654.0,15.0,65.0,14.0,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(50,'Арахис',567.0,26.0,49.0,16.0,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(51,'Масло оливковое',884.0,0.0,100.0,0.0,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(52,'Масло подсолнечное',884.0,0.0,100.0,0.0,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(53,'Мед',329.0,0.3,0.0,81.0,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(54,'Шоколад темный 70%',550.0,7.0,40.0,48.0,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(55,'Майонез',680.0,1.0,72.0,2.5,NULL,NULL,1,NULL,'2026-07-07 11:43:44'),(56,'Молоко 3.2%',60.0,3.0,3.2,4.8,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(57,'Молоко 2.5%',54.0,2.9,2.5,4.8,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(58,'Молоко 1%',42.0,3.0,1.0,4.8,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(59,'Кефир 3.2%',59.0,3.0,3.2,4.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(60,'Йогурт греческий',59.0,10.0,0.5,3.5,140,NULL,1,NULL,'2026-07-07 12:27:00'),(61,'Творог 5%',145.0,16.0,5.0,3.0,200,NULL,1,NULL,'2026-07-07 12:27:00'),(62,'Творог обезжиренный',90.0,18.0,0.5,3.3,200,NULL,1,NULL,'2026-07-07 12:27:00'),(63,'Сыр твердый',392.0,35.0,27.0,0.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(64,'Сыр Моцарелла',280.0,22.0,20.0,2.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(65,'Сметана 20%',206.0,2.5,20.0,3.5,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(66,'Масло сливочное',717.0,0.9,81.0,0.1,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(67,'Куриная грудка',165.0,31.0,3.6,0.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(68,'Куриное бедро',185.0,20.0,11.0,0.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(69,'Индейка филе',135.0,29.0,1.5,0.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(70,'Говядина вырезка',158.0,25.0,6.0,0.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(71,'Говяжий фарш',230.0,18.0,17.0,0.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(72,'Свинина вырезка',143.0,21.0,6.0,0.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(73,'Печень куриная',136.0,20.0,5.0,1.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(74,'Лосось слабосоленый',200.0,22.0,12.0,0.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(75,'Горбуша',140.0,22.0,6.0,0.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(76,'Тунец консервированный',115.0,25.0,1.0,0.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(77,'Треска',82.0,18.0,0.7,0.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(78,'Креветки',99.0,21.0,1.0,0.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(79,'Яйцо куриное',155.0,13.0,11.0,1.1,60,NULL,1,NULL,'2026-07-07 12:27:00'),(80,'Рис белый',130.0,2.7,0.3,28.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(81,'Гречка',343.0,13.0,3.4,72.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(82,'Овсянка (вареная)',68.0,2.5,1.5,12.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(83,'Макароны тв. сорта',350.0,12.0,1.5,72.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(84,'Киноа',120.0,4.0,2.0,21.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(85,'Хлеб цельнозерновой',247.0,13.0,3.4,41.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(86,'Хлеб белый',265.0,8.0,3.0,50.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(87,'Лаваш тонкий',275.0,9.0,2.0,55.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(88,'Огурец',15.0,0.7,0.1,3.6,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(89,'Помидор',18.0,0.9,0.2,3.9,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(90,'Перец болгарский',26.0,1.0,0.3,5.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(91,'Капуста белокочанная',25.0,1.3,0.2,5.8,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(92,'Брокколи',34.0,2.8,0.4,7.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(93,'Морковь',41.0,0.9,0.2,10.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(94,'Лук репчатый',40.0,1.1,0.1,9.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(95,'Картофель',77.0,2.0,0.1,17.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(96,'Авокадо',160.0,2.0,15.0,9.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(97,'Яблоко',52.0,0.3,0.2,14.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(98,'Банан',89.0,1.1,0.3,23.0,120,NULL,1,NULL,'2026-07-07 12:27:00'),(99,'Апельсин',43.0,0.9,0.1,9.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(100,'Клубника',32.0,0.7,0.3,8.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(101,'Виноград',69.0,0.7,0.2,18.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(102,'Арбуз',30.0,0.6,0.2,8.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(103,'Миндаль',579.0,21.0,49.0,21.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(104,'Грецкий орех',654.0,15.0,65.0,14.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(105,'Арахис',567.0,26.0,49.0,16.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(106,'Масло оливковое',884.0,0.0,100.0,0.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(107,'Масло подсолнечное',884.0,0.0,100.0,0.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(108,'Мед',329.0,0.3,0.0,81.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(109,'Шоколад темный 70%',550.0,7.0,40.0,48.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(110,'Майонез',680.0,1.0,72.0,2.5,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(111,'Рис вареный',116.0,2.4,0.3,25.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(112,'Гречка вареная',110.0,4.2,1.1,23.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(113,'Макароны вареные',140.0,5.0,0.8,29.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(114,'Картофель вареный',77.0,2.0,0.1,17.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(115,'Картофель запеченный',93.0,2.5,0.1,21.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(116,'Куриная грудка запеченная',165.0,31.0,3.6,0.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(117,'Куриная грудка вареная',155.0,29.0,3.2,0.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(118,'Куриное филе жареное',197.0,30.0,7.0,0.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(119,'Яйцо вареное',155.0,13.0,11.0,1.1,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(120,'Яйцо жареное (глазунья)',196.0,14.0,15.0,1.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(121,'Овсянка на молоке',102.0,4.0,3.5,14.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(122,'Овсянка на воде',71.0,2.5,1.5,12.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(123,'Говядина отварная',175.0,25.0,8.0,0.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(124,'Свинина отварная',155.0,21.0,7.0,0.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(125,'Индейка запеченная',135.0,29.0,1.5,0.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(126,'Сырок творожный',280.0,12.0,20.0,18.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(127,'Сыр адыгейский',264.0,20.0,20.0,1.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(128,'Сыр копченый',300.0,25.0,22.0,0.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(129,'Творожная масса',280.0,12.0,13.0,28.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(130,'Пельмени',240.0,12.0,10.0,28.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(131,'Вареники с творогом',190.0,8.0,4.0,33.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(132,'Котлета куриная',140.0,18.0,7.0,4.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(133,'Котлета говяжья',205.0,18.0,14.0,5.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(134,'Сосиски',260.0,12.0,23.0,2.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(135,'Колбаса вареная',250.0,12.0,22.0,1.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(136,'Колбаса копченая',400.0,15.0,37.0,1.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(137,'Ветчина',150.0,18.0,8.0,1.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(138,'Фасоль консервированная',90.0,6.0,0.5,16.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(139,'Кукуруза консервированная',90.0,3.0,1.2,17.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(140,'Горошек консервированный',80.0,5.0,0.4,13.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(141,'Кофе черный',2.0,0.2,0.0,0.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(142,'Чай зеленый',1.0,0.0,0.0,0.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(143,'Компот',60.0,0.2,0.0,15.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(144,'Квас',27.0,0.2,0.0,5.0,NULL,NULL,1,NULL,'2026-07-07 12:27:00'),(145,'Молоко 3.2%',60.0,3.0,3.2,4.8,NULL,NULL,1,NULL,'2026-07-07 13:16:52'),(146,'Молоко 2.5%',54.0,2.9,2.5,4.8,NULL,NULL,1,NULL,'2026-07-07 13:16:52'),(147,'Молоко 1%',42.0,3.0,1.0,4.8,NULL,NULL,1,NULL,'2026-07-07 13:16:52'),(148,'Кефир 3.2%',59.0,3.0,3.2,4.0,NULL,NULL,1,NULL,'2026-07-07 13:16:52'),(149,'Йогурт греческий',59.0,10.0,0.5,3.5,140,NULL,1,NULL,'2026-07-07 13:16:52'),(150,'Творог 5%',145.0,16.0,5.0,3.0,200,NULL,1,NULL,'2026-07-07 13:16:52'),(151,'Творог обезжиренный',90.0,18.0,0.5,3.3,200,NULL,1,NULL,'2026-07-07 13:16:52'),(152,'Сыр твердый',392.0,35.0,27.0,0.0,NULL,NULL,1,NULL,'2026-07-07 13:16:52'),(153,'Сыр Моцарелла',280.0,22.0,20.0,2.0,NULL,NULL,1,NULL,'2026-07-07 13:16:52'),(154,'Сметана 20%',206.0,2.5,20.0,3.5,NULL,NULL,1,NULL,'2026-07-07 13:16:52'),(155,'Масло сливочное',717.0,0.9,81.0,0.1,NULL,NULL,1,NULL,'2026-07-07 13:16:52'),(156,'Куриная грудка',165.0,31.0,3.6,0.0,NULL,NULL,1,NULL,'2026-07-07 13:16:52'),(157,'Куриное бедро',185.0,20.0,11.0,0.0,NULL,NULL,1,NULL,'2026-07-07 13:16:52'),(158,'Индейка филе',135.0,29.0,1.5,0.0,NULL,NULL,1,NULL,'2026-07-07 13:16:52'),(159,'Говядина вырезка',158.0,25.0,6.0,0.0,NULL,NULL,1,NULL,'2026-07-07 13:16:52'),(160,'Говяжий фарш',230.0,18.0,17.0,0.0,NULL,NULL,1,NULL,'2026-07-07 13:16:52'),(161,'Свинина вырезка',143.0,21.0,6.0,0.0,NULL,NULL,1,NULL,'2026-07-07 13:16:52'),(162,'Печень куриная',136.0,20.0,5.0,1.0,NULL,NULL,1,NULL,'2026-07-07 13:16:52'),(163,'Лосось слабосоленый',200.0,22.0,12.0,0.0,NULL,NULL,1,NULL,'2026-07-07 13:16:52'),(164,'Горбуша',140.0,22.0,6.0,0.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(165,'Тунец консервированный',115.0,25.0,1.0,0.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(166,'Треска',82.0,18.0,0.7,0.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(167,'Креветки',99.0,21.0,1.0,0.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(168,'Яйцо куриное',155.0,13.0,11.0,1.1,60,NULL,1,NULL,'2026-07-07 13:16:53'),(169,'Рис белый',130.0,2.7,0.3,28.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(170,'Гречка',343.0,13.0,3.4,72.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(171,'Овсянка (вареная)',68.0,2.5,1.5,12.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(172,'Макароны тв. сорта',350.0,12.0,1.5,72.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(173,'Киноа',120.0,4.0,2.0,21.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(174,'Хлеб цельнозерновой',247.0,13.0,3.4,41.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(175,'Хлеб белый',265.0,8.0,3.0,50.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(176,'Лаваш тонкий',275.0,9.0,2.0,55.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(177,'Огурец',15.0,0.7,0.1,3.6,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(178,'Помидор',18.0,0.9,0.2,3.9,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(179,'Перец болгарский',26.0,1.0,0.3,5.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(180,'Капуста белокочанная',25.0,1.3,0.2,5.8,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(181,'Брокколи',34.0,2.8,0.4,7.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(182,'Морковь',41.0,0.9,0.2,10.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(183,'Лук репчатый',40.0,1.1,0.1,9.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(184,'Картофель',77.0,2.0,0.1,17.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(185,'Авокадо',160.0,2.0,15.0,9.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(186,'Яблоко',52.0,0.3,0.2,14.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(187,'Банан',89.0,1.1,0.3,23.0,120,NULL,1,NULL,'2026-07-07 13:16:53'),(188,'Апельсин',43.0,0.9,0.1,9.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(189,'Клубника',32.0,0.7,0.3,8.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(190,'Виноград',69.0,0.7,0.2,18.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(191,'Арбуз',30.0,0.6,0.2,8.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(192,'Миндаль',579.0,21.0,49.0,21.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(193,'Грецкий орех',654.0,15.0,65.0,14.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(194,'Арахис',567.0,26.0,49.0,16.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(195,'Масло оливковое',884.0,0.0,100.0,0.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(196,'Масло подсолнечное',884.0,0.0,100.0,0.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(197,'Мед',329.0,0.3,0.0,81.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(198,'Шоколад темный 70%',550.0,7.0,40.0,48.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(199,'Майонез',680.0,1.0,72.0,2.5,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(200,'Рис вареный',116.0,2.4,0.3,25.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(201,'Гречка вареная',110.0,4.2,1.1,23.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(202,'Макароны вареные',140.0,5.0,0.8,29.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(203,'Картофель вареный',77.0,2.0,0.1,17.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(204,'Картофель запеченный',93.0,2.5,0.1,21.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(205,'Куриная грудка запеченная',165.0,31.0,3.6,0.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(206,'Куриная грудка вареная',155.0,29.0,3.2,0.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(207,'Куриное филе жареное',197.0,30.0,7.0,0.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(208,'Яйцо вареное',155.0,13.0,11.0,1.1,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(209,'Яйцо жареное (глазунья)',196.0,14.0,15.0,1.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(210,'Овсянка на молоке',102.0,4.0,3.5,14.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(211,'Овсянка на воде',71.0,2.5,1.5,12.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(212,'Говядина отварная',175.0,25.0,8.0,0.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(213,'Свинина отварная',155.0,21.0,7.0,0.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(214,'Индейка запеченная',135.0,29.0,1.5,0.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(215,'Сырок творожный',280.0,12.0,20.0,18.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(216,'Сыр адыгейский',264.0,20.0,20.0,1.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(217,'Сыр копченый',300.0,25.0,22.0,0.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(218,'Творожная масса',280.0,12.0,13.0,28.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(219,'Пельмени',240.0,12.0,10.0,28.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(220,'Вареники с творогом',190.0,8.0,4.0,33.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(221,'Котлета куриная',140.0,18.0,7.0,4.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(222,'Котлета говяжья',205.0,18.0,14.0,5.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(223,'Сосиски',260.0,12.0,23.0,2.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(224,'Колбаса вареная',250.0,12.0,22.0,1.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(225,'Колбаса копченая',400.0,15.0,37.0,1.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(226,'Ветчина',150.0,18.0,8.0,1.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(227,'Фасоль консервированная',90.0,6.0,0.5,16.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(228,'Кукуруза консервированная',90.0,3.0,1.2,17.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(229,'Горошек консервированный',80.0,5.0,0.4,13.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(230,'Кофе черный',2.0,0.2,0.0,0.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(231,'Чай зеленый',1.0,0.0,0.0,0.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(232,'Компот',60.0,0.2,0.0,15.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53'),(233,'Квас',27.0,0.2,0.0,5.0,NULL,NULL,1,NULL,'2026-07-07 13:16:53');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recipe_ingredients`
--

DROP TABLE IF EXISTS `recipe_ingredients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipe_ingredients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `recipe_id` int NOT NULL,
  `product_id` int NOT NULL,
  `grams` decimal(7,1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `recipe_id` (`recipe_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `recipe_ingredients_ibfk_1` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `recipe_ingredients_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipe_ingredients`
--

LOCK TABLES `recipe_ingredients` WRITE;
/*!40000 ALTER TABLE `recipe_ingredients` DISABLE KEYS */;
INSERT INTO `recipe_ingredients` VALUES (1,1,24,60.0),(2,1,27,30.0),(3,2,12,150.0),(4,2,25,100.0),(5,2,33,50.0),(6,3,43,120.0),(7,3,1,200.0),(8,4,6,200.0),(9,4,24,60.0),(10,5,30,50.0),(11,5,41,100.0);
/*!40000 ALTER TABLE `recipe_ingredients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recipe_steps`
--

DROP TABLE IF EXISTS `recipe_steps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipe_steps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `recipe_id` int NOT NULL,
  `step_number` int NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `recipe_id` (`recipe_id`),
  CONSTRAINT `recipe_steps_ibfk_1` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipe_steps`
--

LOCK TABLES `recipe_steps` WRITE;
/*!40000 ALTER TABLE `recipe_steps` DISABLE KEYS */;
INSERT INTO `recipe_steps` VALUES (1,1,1,'Смешать яйцо с овсянкой'),(2,1,2,'Обжарить на сковороде 2 мин с каждой стороны'),(3,2,1,'Отварить рис'),(4,2,2,'Обжарить куриную грудку'),(5,2,3,'Нарезать огурец, смешать'),(6,3,1,'Смешать все в блендере до однородности'),(7,4,1,'Смешать творог с яйцом'),(8,4,2,'Выпекать 25 мин при 180°C'),(9,5,1,'Поджарить хлеб'),(10,5,2,'Размять авокадо, намазать на тост');
/*!40000 ALTER TABLE `recipe_steps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recipes`
--

DROP TABLE IF EXISTS `recipes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_user_recipe` tinyint(1) DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `recipes_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipes`
--

LOCK TABLES `recipes` WRITE;
/*!40000 ALTER TABLE `recipes` DISABLE KEYS */;
INSERT INTO `recipes` VALUES (1,'Овсяноблин','breakfast',0,NULL,'2026-07-07 11:43:44'),(2,'Курица с рисом','lunch',0,NULL,'2026-07-07 11:43:44'),(3,'Смузи банановый','breakfast',0,NULL,'2026-07-07 11:43:44'),(4,'Творожная запеканка','breakfast',0,NULL,'2026-07-07 11:43:44'),(5,'Авокадо-тост','high_fat',0,NULL,'2026-07-07 11:43:44');
/*!40000 ALTER TABLE `recipes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `goal` enum('lose','maintain','gain','manual') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender` enum('male','female') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `age` int DEFAULT NULL,
  `height` int DEFAULT NULL,
  `weight` decimal(5,1) DEFAULT NULL,
  `activity_level` enum('minimal','light','moderate','high','extreme') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gym_days_per_week` int DEFAULT NULL,
  `is_mass_gain_mode` tinyint(1) DEFAULT '0',
  `manual_proteins` decimal(6,1) DEFAULT NULL,
  `manual_fats` decimal(6,1) DEFAULT NULL,
  `manual_carbs` decimal(6,1) DEFAULT NULL,
  `daily_calories` int DEFAULT NULL,
  `daily_proteins` decimal(6,1) DEFAULT NULL,
  `daily_fats` decimal(6,1) DEFAULT NULL,
  `daily_carbs` decimal(6,1) DEFAULT NULL,
  `is_premium` tinyint(1) DEFAULT '0',
  `is_onboarded` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'test@easyway.app','$2a$10$AN3sUp5j2uZQr/lAC3qSwONh9npz7A/ourg7Axh85paSj.gK8FmmK','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,1,'2026-07-07 11:43:44','2026-07-07 12:36:26');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `weight_entries`
--

DROP TABLE IF EXISTS `weight_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `weight_entries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `date` date NOT NULL,
  `weight` decimal(5,1) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_weight_date` (`user_id`,`date`),
  CONSTRAINT `weight_entries_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `weight_entries`
--

LOCK TABLES `weight_entries` WRITE;
/*!40000 ALTER TABLE `weight_entries` DISABLE KEYS */;
/*!40000 ALTER TABLE `weight_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'easyway_calories'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-07 17:30:57
